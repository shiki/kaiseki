
var config = require('./config');
var should = require('should');
var async = require('async');
var Kaiseki = require('../lib/kaiseki');
var _ = require('underscore');

var parse = new Kaiseki(config);

var users = {
  'Zennia': {
    name: 'Zennia',
    gender: 'female',
    nickname: 'Zen',
    username: 'zennia',
    password: 'password'
  },
  'Maricris': {
    name: 'Maricris',
    gender: 'female',
    nickname: 'Kit',
    username: 'maricris',
    password: 'whew'
  },
  'Joel': {
    name: 'Joel',
    gender: 'male',
    nickname: 'JB1',
    username: 'joel',
    password: 'monkayo'
  }
};

// users as an array
var userValues = _(users).values();

// for "before" hook
var deleteUsers = function(callback) {
  // query all
  parse.getUsers(function(err, res, body) {
    // delete all
    async.forEach(body, function(item, callback) {
      async.waterfall([
        // login first
        function(callback) {
          parse.loginUser(item.username, users[item.name].password, function(err, res, body, success) {
            success.should.be.true;
            callback(err, body);
          });
        },
        // delete
        function(object, callback) {
          parse.sessionToken = object.sessionToken;
          parse.deleteUser(object.objectId, function(err, res, body, success) {
            success.should.be.true;
            callback(err);
          });
        }
      ], function(err, results) {
        callback(err);
      });
    }, function(err, results) {
      callback(err);
    });
  });
};


describe('user', function() {
  var object = null; // the Parse user object
  var user = users['Zennia'];

  before(deleteUsers);
  after(deleteUsers);

  it('can create', function(done) {
    parse.createUser(user, function(err, res, body, success) {
      success.should.be.true;
      should.not.exist(err);
      should.exist(body.createdAt);
      should.exist(body.objectId);
      should.exist(body.sessionToken);
      user.gender.should.eql(body.gender);
      object = body;

      done();
    });
  });

  //{ code: 200, message: 'bad or missing username' }
  it('returns errors on incomplete create data', function(done) {
    var incomplete = {name: 'Ling'};
    parse.createUser(incomplete, function(err, res, body, success) {
      success.should.be.false;
      should.not.exist(body.name);
      body.code.should.eql(200);
      body.error.should.eql('bad or missing username');
      done(err);
    });
  });

  it('can get', function(done) {
    parse.getUser(object.objectId, function(err, res, body, success) {
      success.should.be.true;
      should.exist(body.updatedAt);
      var compare = _.pick(object, 'name', 'gender', 'username', 'nickname', 'createdAt', 'objectId');
      var compare2 = _.pick(body, 'name', 'gender', 'username', 'nickname', 'createdAt', 'objectId');
      compare.should.eql(compare2);
      done();
    });
  });

  it('can login', function(done) {
    parse.loginUser(object.username, object.password, function(err, res, body, success) {
      success.should.be.true;
      //once parse-server require revocable session, token is get from Session, not user object itself
      body.should.have.property('sessionToken');
      object.sessionToken = body.sessionToken;
      done();
    });
  });

  it('can get current', function(done) {
    var sessionConfig = _.extend(_.clone(config), {sessionToken: object.sessionToken});
    var parse = new Kaiseki(sessionConfig);
    parse.getCurrentUser(function(err, res, body, success) {
      body.nickname.should.eql(object.nickname);
      body.objectId.should.eql(object.objectId);
      success.should.be.true;
      done();
    });
  });

  it('can update', function(done) {
    var newNick = 'Inday';
    async.series([
      // update
      function(callback) {
        var sessionConfig = _.extend(_.clone(config), {sessionToken: object.sessionToken});
        var parse = new Kaiseki(sessionConfig);
        parse.updateUser(object.objectId, {nickname: newNick}, function(err, res, body, success) {
          success.should.be.true;
          should.exist(body.updatedAt);
          callback(err);
        });
      },

      // test updated data
      function(callback) {
        parse.getUser(object.objectId, function(err, res, body, success) {
          success.should.be.true;
          body.nickname.should.not.eql(object.nickname);
          body.nickname.should.eql(newNick);
          callback(err);
        });
      }
    ], function(err, resulsts) {
      done();
    });
  });

  it('can delete', function(done) {
    var sessionConfig = _.extend(_.clone(config), {sessionToken: object.sessionToken});
    var parse = new Kaiseki(sessionConfig);
    async.series([
      // delete
      function(callback) {
        parse.deleteUser(object.objectId, function(err, res, body, success) {
          success.should.be.true;
          should.not.exist(err);
          res.statusCode.should.eql(200);
          callback(err);
        });
      },

      // test with GET
      // { code: 101, message: 'Object not found.' }
      function(callback) {
        parse.getUser(object.objectId, function(err, res, body, success) {
          success.should.be.false;
          res.statusCode.should.eql(404);
          callback(err);
        });
      }
    ], function(err, results) {
      done(err);
    });

  });

  // Currently turned off cause we need to have a proper email configuration in the parse
  // server to test this
  xit('can request password reset', function(done) {
    var parse = new Kaiseki(config);
    var joel = _.clone(users['Joel']);
    joel.email = 'jb1@parse.com';
    parse.createUser(joel, function(err, res, body, success) {
      success.should.be.true;
      parse.requestPasswordReset(joel.email, function(err, res, body, success) {
        success.should.be.true;
        should.exist(body);
        _.isObject(body).should.be.true;
        should.not.exist(err);
        res.statusCode.should.eql(200);

        done(err);
      });
    });
  });

  xit('returns error on non-existent email', function(done) {
    var parse = new Kaiseki(config);
    var email = 'probablyandunknownuser@parse.com';
    parse.requestPasswordReset(email, function(err, res, body, success) {
      success.should.be.false;
      body.code.should.eql(205);
      body.error.should.eql('no user found with email ' + email);

      done(err);
    });
  });
});


describe('users', function() {
  var objects = []; // objects for queries
  var objectIds = null;

  // create objects for testing
  before(function(done) {
    async.series([
      deleteUsers, // just to be sure

      function(callback) {
        async.forEach(userValues,
          function(item, callback) {
            parse.createUser(item, function(err, res, body, success) {
              success.should.be.true;
              objects.push(body);
              callback(err);
            });
          },
          function(err) {
            objects = _(objects).sortBy('objectId');
            callback(err);
          }
        );
      }
    ], function(err, results) {
      done(err);
    });
  });

  // delete users after testing
  after(deleteUsers);

  it('supports basic queries', function(done) {
    // check data first
    objects.should.have.length(userValues.length);
    objectIds = _(objects).pluck('objectId').sort();

    var objectsToCompare = _(objects).map(function(item) {
      return _.pick(item, 'name', 'gender', 'username', 'nickname', 'createdAt', 'updatedAt', 'objectId');
    });

    // query all
    parse.getUsers(function(err, res, body, success) {
      success.should.be.true;
      body.should.have.length(userValues.length);

      var fetchedIds = _(body).pluck('objectId').sort();
      objectIds.should.eql(fetchedIds);

      body = _(body).sortBy('objectId');
      // copy updatedAt for easy comparision
      _(objectsToCompare).each(function(item, index) { item.updatedAt = body[index].updatedAt; });
      var target = _(body).map(function(item) {
        return _.pick(item, 'name', 'gender', 'username', 'nickname', 'createdAt', 'updatedAt', 'objectId');
      });
      objectsToCompare.should.eql(target);

      done();
    });
  });

  it('supports query constraints', function(done) {
    var params = { where: {gender: "female"} };
    parse.getUsers(params, function(err, res, body, success) {
      success.should.be.true;
      body.length.should.eql(2);
      var names = _(body).pluck('name').sort();
      names.should.eql(['Maricris', 'Zennia']);

      done(err);
    });
  });

  it('supports multiple query constraints', function(done) {
    async.series([
      // order
      function(callback) {
        var expected = _(objects).pluck('name').sort();
        var params = { order: 'name' };
        parse.getUsers(params, function(err, res, body, success) {
          success.should.be.true;
          body.length.should.eql(expected.length);
          var names = _(body).pluck('name');
          names.should.eql(expected);

          callback();
        });
      },

      // where and order
      function(callback) {
        var expected = ['Zennia', 'Maricris'];
        var params = { where: {gender: "female"}, order: '-name' };
        parse.getUsers(params, function(err, res, body, success) {
          success.should.be.true;
          body.length.should.eql(expected.length);
          var names = _(body).pluck('name');
          names.should.eql(expected);

          callback();
        });
      }

    ], function(err, results) {
      done(err);
    });
  });

});


var config = require('./config');
var should = require('should');
var async = require('async');
var Kaiseki = require('../lib/kaiseki');
var _ = require('underscore');

var parse = new Kaiseki(config.PARSE_APP_ID, config.PARSE_REST_API_KEY);

var users = {
  'Zennia': {
    name: 'Zennia',
    gender: 'female',
    nickname: 'Zen',
    username: 'zennia',
    password: 'password'
  }
};

// for "before" hook
var deleteUsers = function(callback) {
  // query all
  parse.getUsers(function(err, res, body) {
    // delete all
    async.forEach(body, function(item, callback) {
      async.waterfall([
        // login first
        function(callback) {
          parse.loginUser(item.username, users[item.name].password, function(err, res, body) {
            callback(err, body);
          });
        },
        // delete
        function(object, callback) {
          parse.deleteUser(item, object.sessionToken, function(err, res, body) {
            console.log(body);
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

  it('can create', function(done) {
    parse.createUser(user, function(err, res, body) {
      should.not.exist(err);
      should.exist(body.createdAt);
      should.exist(body.objectId);
      should.exist(body.sessionToken);
      user.gender.should.eql(body.gender);
      object = body;

      done();
    });
  });

  it('can get', function(done) {
    parse.getUser(object.objectId, function(err, res, body) {
      should.exist(body.updatedAt);
      var compare = _.pick(object, 'name', 'gender', 'username', 'nickname', 'createdAt', 'objectId');
      compare.updatedAt = body.updatedAt;
      compare.should.eql(body);
      done();
    });
  });

  it('can login', function(done) {
    parse.loginUser(object.username, object.password, function(err, res, body) {
      body.sessionToken.should.eql(object.sessionToken);
      done();
    });
  });

  it('can update', function(done) {
    var newNick = 'Inday';
    async.series([
      // update
      function(callback) {
        parse.updateUser(object.objectId, object.sessionToken, {nickname: newNick}, function(err, res, body) {
          should.exist(body.updatedAt);
          callback(err);
        });
      },

      // test updated data
      function(callback) {
        parse.getUser(object.objectId, function(err, res, body) {
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
    parse.deleteUser(object.objectId, object.sessionToken, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.eql(200);
      done();
    });
  });
});
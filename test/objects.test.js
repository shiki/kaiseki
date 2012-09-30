
var config = require('./config');
var should = require('should');
var async = require('async');
var Kaiseki = require('../lib/kaiseki');
var _ = require('underscore');

var className = 'Dogs';
var parse = new Kaiseki(config.PARSE_APP_ID, config.PARSE_REST_API_KEY);

describe('object', function() {
  var dog = {
    name: 'Prince',
    breed: 'Pomeranian'
  };
  var object = null; // the Parse object we'll be passing along

  it('can create', function(done) {
    async.parallel([
      function(done) {
        parse.createObject(className, dog, function(err, res, body, success) {
          success.should.be.true;
          should.not.exist(err);
          object = body;

          object.name.should.eql(dog.name);
          object.breed.should.eql(dog.breed);
          should.exist(object.createdAt);
          should.exist(object.objectId);

          done(err);
        });
      },
      function(done) {
        var invalid = {
          name: 'Woof',
          owner: {
            __type: 'InvalidName'
          }
        };
        parse.createObject(className, invalid, function(err, res, body, success) {
          success.should.be.false;
          should.not.exist(err);
          should.not.exist(body.name);
          should.not.exist(body.owner);

          body.code.should.eql(111);

          done(err);
        });
      }
    ], function(err) {
      done(err);
    });
  });

  it('can get', function(done) {
    parse.getObject(className, object.objectId, function(err, res, body, success) {
      success.should.be.true;
      should.not.exist(err);
      // object from .createObject does not have updatedAt
      object.updatedAt = body.updatedAt;

      body.should.eql(object);

      done();
    });
  });

  it('can update', function(done) {
    var newName = 'Princess';
    async.series([
      // update the object
      function(callback) {
        parse.updateObject(className, object.objectId, { name: newName }, function(err, res, body, success) {
          success.should.be.true;
          should.not.exist(err);
          should.exist(body.updatedAt);
          callback(null, body);
        });
      },
      // get the object and test that it has really changed
      function(callback) {
        parse.getObject(className, object.objectId, function(err, res, body, success) {
          success.should.be.true;
          should.not.exist(err);
          body.objectId.should.eql(object.objectId);
          body.should.not.eql(object);
          body.name.should.eql(newName);

          callback(null, body);
        });
      }
    ], function(err, results) {
      done();
    });
  });

  it('can delete', function(done) {
    async.series([
      // delete the object
      function(callback) {
        parse.deleteObject(className, object.objectId, function(err, res, body, success) {
          success.should.be.true;
          should.not.exist(err);
          res.statusCode.should.eql(200);

          callback(null);
        });
      },
      // query again to make sure that it was deleted
      function(callback) {
        parse.getObject(className, object.objectId, function(err, res, body, success) {
          success.should.be.false;
          should.not.exist(err);
          res.statusCode.should.eql(404);
          should.exist(body.error);
          callback(null);
        });
      }
    ], function(err, results) {
      done();
    });
  });
});


describe('objects', function() {
  var dogs = [
    {name: 'Prince', breed: 'Pomeranian'},
    {name: 'Princess', breed: 'Maltese'},
    {name: 'Keiko', breed: 'Chow Chow'},
    {name: 'Buddy', breed: 'Maltese'}
  ];
  var objects = []; // objects for queries
  var objectIds = null;

  // create objects for testing
  before(function(done) {
    async.series([
      // just to be sure, delete all data in the table
      function(callback) {
        // query all
        parse.getObjects(className, function(err, res, body, success) {
          success.should.be.true;
          var fetchedIds = _(body).pluck('objectId').sort();
          // delete all
          async.forEach(fetchedIds, function(item, callback) {
            parse.deleteObject(className, item, function(err, res, body, success) {
              success.should.be.true;
              callback(err);
            });
          }, function(err, results) {
            callback(err);
          });
        });
      },

      function(callback) {
        async.forEach(dogs,
          function(item, callback) {
            parse.createObject(className, item, function(err, res, body, success) {
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

  // delete objects after testing
  after(function(done) {
    async.forEach(objects,
      function(item, callback) {
        parse.deleteObject(className, item.objectId, function(err, res, body, success) {
          success.should.be.true;
          callback(err);
        });
      },
      function(err) {
        done();
      }
    );
  });

  it('supports basic queries', function(done) {
    // check data first
    objects.should.have.length(dogs.length);
    objectIds = _(objects).pluck('objectId').sort();

    // query all
    parse.getObjects(className, function(err, res, body, success) {
      success.should.be.true;
      body.should.have.length(dogs.length);

      var fetchedIds = _(body).pluck('objectId').sort();
      objectIds.should.eql(fetchedIds);

      body = _(body).sortBy('objectId');
      // copy updatedAt for easy comparision later
      _(objects).each(function(item, index) { item.updatedAt = body[index].updatedAt; });
      objects.should.eql(body);

      //console.log(fetchedIds, objectIds);
      done();
    });
  });

  it('supports query constraints', function(done) {
    var params = { where: {breed: "Maltese"} };
    parse.getObjects(className, params, function(err, res, body, success) {
      success.should.be.true;
      body.length.should.eql(2);
      var names = _(body).pluck('name').sort();
      names.should.eql(['Buddy', 'Princess']);

      done(err);
    });
  });

  it('supports multiple query constraints', function(done) {
    async.series([
      // order
      function(callback) {
        var expected = _(objects).pluck('name').sort();
        var params = { order: 'name' };
        parse.getObjects(className, params, function(err, res, body, success) {
          success.should.be.true;
          body.length.should.eql(expected.length);
          var names = _(body).pluck('name');
          names.should.eql(expected);

          callback();
        });
      },

      // where and order
      function(callback) {
        var expected = ['Princess', 'Buddy'];
        var params = { where: {breed: "Maltese"}, order: '-name' };
        parse.getObjects(className, params, function(err, res, body, success) {
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

  it('returns correct results on 404', function(done) {
    var params = { where: { name: 'Dragon' } };
    parse.getObjects(className, params, function(err, res, body, success) {
      success.should.be.true;
      body.length.should.eql(0);

      done();
    });
  });

  it('can count', function(done) {
    async.parallel([
      function(done) {
        var params = { count: true };
        parse.getObjects(className, params, function(err, res, body, success) {
          success.should.be.true;
          body.results.length.should.eql(dogs.length);
          body.count.should.eql(dogs.length);
          done();
        });
      },
      function(done) {
        var params = {
          where: { breed: 'Maltese' },
          count: true
        };
        parse.getObjects(className, params, function(err, res, body, success) {
          success.should.be.true;
          body.results.length.should.eql(2);
          body.count.should.eql(2);
          done();
        });
      }
    ], function(err, results) {
      should.not.exist(err);
      done();
    });

  });

  it('can count using countObjects', function(done) {
    async.parallel([
      function(done) {
        parse.countObjects(className, function(err, res, body, success) {
          success.should.be.true;
          body.count.should.eql(dogs.length);
          done();
        });
      },
      function(done) {
        var params = {
          where: { breed: 'Maltese' }
        };
        parse.countObjects(className, params, function(err, res, body, success) {
          success.should.be.true;
          body.count.should.eql(2);
          done();
        });
      }
    ], function(err, results) {
      should.not.exist(err);
      done();
    });
  });

});



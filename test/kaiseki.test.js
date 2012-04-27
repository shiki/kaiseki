
var PARSE_APP_ID = 'uoVDvekxzKVrPay12PR9rFhMk18xSiXjUFJRQ893';
var PARSE_REST_API_KEY = 'KaDTOFik6e2Zk94wVKkyNxahWCHdL9muzOFLoqr7';

var should = require('should');
var async = require('async');
var Kaiseki = require('../lib/kaiseki');

describe('Objects', function() {

  var parse = new Kaiseki(PARSE_APP_ID, PARSE_REST_API_KEY);
  var dog = {
    name: 'Prince',
    breed: 'Pomeranian'
  };
  var className = 'Dogs';
  var object = null; // the Parse object we'll be passing along

  it('can create', function(done) {
    parse.createObject(className, dog, function(err, res, body) {
      should.not.exist(err);
      object = body;

      object.name.should.eql(dog.name);
      object.breed.should.eql(dog.breed);
      should.exist(object.createdAt);
      should.exist(object.objectId);

      done();
    });    
  });

  it('can get', function(done) {
    parse.getObject(className, object.objectId, function(err, res, body) {
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
        parse.updateObject(className, object.objectId, { name: newName }, function(err, res, body) {
          should.not.exist(err);
          should.exist(body.updatedAt);
          callback(null, body);
        });
      },
      // get the object and test that it has really changed
      function(callback) {
        parse.getObject(className, object.objectId, function(err, res, body) {
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
        parse.deleteObject(className, object.objectId, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.eql(200);

          callback(null);
        });
      },
      // query again to make sure that it was deleted
      function(callback) {
        parse.getObject(className, object.objectId, function(err, res, body) {
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
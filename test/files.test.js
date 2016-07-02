
var config = require('./config');
var should = require('should');
var async = require('async');
var Kaiseki = require('../lib/kaiseki');
var request = require('request');
var _ = require('underscore');

var parse = new Kaiseki(config);

describe('file', function() {
  var imageFilePath = __dirname + '/fixtures/apple.jpg';

  it('can upload a file', function(done) {
    var fileName = 'orange.jpg';
    parse.uploadFile(imageFilePath, fileName, function(err, res, body, success) {
      success.should.be.true;
      should.exist(body.url);
      should.exist(body.name);
      body.url.should.endWith(fileName);
      body.name.should.endWith(fileName);

      request.get(body.url, function(err, res, body) {
        res.statusCode.should.eql(200);
        res.headers['content-type'].should.eql('image/jpeg');
        done();
      });
    });
  });

  it('can upload a file without specifying the filename', function(done) {
    parse.uploadFile(imageFilePath, function(err, res, body, success) {
      var fileName = 'apple.jpg'; // expected

      success.should.be.true;
      should.exist(body.url);
      should.exist(body.name);
      body.url.should.endWith(fileName);
      body.name.should.endWith(fileName);

      request.get(body.url, function(err, res, body) {
        res.statusCode.should.eql(200);
        res.headers['content-type'].should.eql('image/jpeg');
        done();
      });
    });
  });

  it('can upload a file buffer', function(done) {
    var buffer = require('fs').readFileSync(imageFilePath);
    var fileName = 'orange.jpg';
    var contentType = 'image/jpeg';
    parse.uploadFileBuffer(buffer, contentType, fileName, function(err, res, body, success) {
      success.should.be.true;
      should.exist(body.url);
      should.exist(body.name);
      body.url.should.endWith(fileName);
      body.name.should.endWith(fileName);

      request.get(body.url, function(err, res, body) {
        res.statusCode.should.eql(200);
        res.headers['content-type'].should.eql(contentType);
        done();
      });
    });
  });

  it('can upload simple text as a file', function(done) {
    var data = 'my text file contents';
    var contentType = 'text/plain';
    var fileName = 'text.txt';
    parse.uploadFileBuffer(data, contentType, fileName, function(err, res, body, success) {
      success.should.be.true;
      should.exist(body.url);
      should.exist(body.name);
      body.url.should.endWith(fileName);
      body.name.should.endWith(fileName);

      request.get(body.url, function(err, res, body) {
        body.should.eql(data);
        res.statusCode.should.eql(200);
        res.headers['content-type'].should.startWith(contentType);
        done();
      });
    });
  });

  it('can delete a file (using API masterkey)', function(done) {
    async.waterfall([
      function(callback) {
        parse.uploadFile(imageFilePath, function(err, res, body, success) {
          request.get(body.url, function(err, res, data) {
            res.statusCode.should.eql(200);
            res.headers['content-type'].should.eql('image/jpeg');
            callback(err, body.url, body.name);
          });
        });
      },
      function(url, fileName, callback) {
        var parseWithMaster = new Kaiseki(require('./config-master'));
        parseWithMaster.deleteFile(fileName, function(err, res, body, success) {
          res.statusCode.should.eql(200);
          request.get(url, function(err, res, data) {
            //It take a little time to delete it. It will response 403 later.
            res.statusCode.should.within(403, 404);
            callback(err);
          });
        });
      }
    ], function(err, result) {
      done(err);
    });
  });

  it('can associate a file to a new object', function(done) {
    var className = 'Dogs';

    parse.uploadFile(imageFilePath, function(err, res, uploadBody, success) {
      success.should.be.true;

      var dog = {
        name: 'Paaka',
        breed: 'Rottweiler',
        photo: {
          name: uploadBody.name,
          __type: 'File'
        }
      };
      parse.createObject(className, dog, function(err, res, body, success) {
        success.should.be.true;
        parse.getObject(className, body.objectId, function(err, res, body, success) {
          success.should.be.true;
          should.exist(body.photo);
          body.photo.name.should.eql(uploadBody.name);
          body.photo.url.should.eql(uploadBody.url);
          done(err);
        });
      });
    });
  });

  it('can associate a file to an existing object', function(done) {
    var className = 'Dogs';
    var dog = {
      name: 'Waku Waku',
      breed: 'Pomeranian/Maltese'
    };
    async.waterfall([
      function(callback) {
        parse.createObject(className, dog, function(err, res, body, success) {
          success.should.be.true;
          parse.getObject(className, body.objectId, function(err, res, body, success) {
            success.should.be.true;
            should.not.exist(body.photo);
            callback(err, body.objectId);
          });
        });
      },
      function(objectId, callback) {
        parse.uploadFile(imageFilePath, function(err, res, uploadBody, success) {
          success.should.be.true;
          // attach
          var data = {
            photo: {
              name: uploadBody.name,
              __type: 'File'
            }
          };
          parse.updateObject(className, objectId, data, function(err, res, body, success) {
            success.should.be.true;
            callback(err, objectId, uploadBody);
          });
        });
      },
      function(objectId, uploadBody, callback) {
        // get and verify
        parse.getObject(className, objectId, function(err, res, body, success) {
          success.should.be.true;
          body.photo.name.should.eql(uploadBody.name);
          body.photo.url.should.eql(uploadBody.url);
          callback(err);
        });
      }
    ], function(err, results) {
      done();
    });

  });
});

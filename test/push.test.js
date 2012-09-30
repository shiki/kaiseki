
var config = require('./config');
var should = require('should');
var async = require('async');
var Kaiseki = require('../lib/kaiseki');
var request = require('request');
var _ = require('underscore');

var parse = new Kaiseki(config.PARSE_APP_ID, config.PARSE_REST_API_KEY);

describe('push', function() {
  it('can broadcast a notification', function(done) {
    async.parallel([
      // Android
      function(callback) {
        var notification = {
          channels: [''],
          type: 'android',
          data: {
            alert: 'The next World Series has been announced'
          }
        };

        parse.sendPushNotification(notification, function(err, res, body, success) {
          success.should.be.true;
          should.exist(body.result);
          should.exist(res);
          body.result.should.be.true;

          callback(err);
        });
      },
      // iOS. We're expecting that this will fail because we didn't set up Push certificates yet.
      function(callback) {
        var notification = {
          channels: [''],
          type: 'ios',
          data: {
            alert: 'The next World Series has been announced'
          }
        };

        parse.sendPushNotification(notification, function(err, res, body, success) {
          success.should.be.false;
          body.error.should.eql('To push to iOS devices, you must first configure a valid certificate.');
          body.code.should.eql(115);

          should.not.exist(body.data);
          should.exist(res);

          callback(err);
        });
      }
    ], function(err, results) {
      done(err);
    });
  });
});

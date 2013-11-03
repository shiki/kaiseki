var config = require('./config');
var should = require('should');
var Kaiseki = require('../lib/kaiseki');

var parse = new Kaiseki(config.PARSE_APP_ID, config.PARSE_REST_API_KEY);

describe('analytics', function() {
  it('can update app opened', function(done) {
    parse.sendAnalyticsEvent('AppOpened', function(err, res, body, success) {
      success.should.be.true;
      should.not.exist(err);
      should.exist(res);
      should.exist(body);
      done();
    });
  });

  it('can track custom analytic named search', function(done) {
    parse.sendAnalyticsEvent('Search', {
      'priceRange': '1000-1500',
      'source': 'craigslist',
      'dayType': 'weekday'
    }, function(err, res, body, success) {
      success.should.be.true;
      should.not.exist(err);
      should.exist(res);
      should.exist(body);
      done();
    });
  });

  it('can track custom analytic named search empty params', function(done) {
    parse.sendAnalyticsEvent('Search', {}, function(err, res, body, success) {
      success.should.be.true;
      should.not.exist(err);
      should.exist(res);
      should.exist(body);
      done();
    });
  });

  it('can update error', function(done) {
    parse.sendAnalyticsEvent('Error', {'code' : '404'}, function(err, res, body, success) {
      success.should.be.true;
      should.not.exist(err);
      should.exist(res);
      should.exist(body);
      done();
    });
  });
});

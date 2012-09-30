
var config = require('./config');
var Kaiseki = require('../lib/Kaiseki');
var should = require('should');

var parse = new Kaiseki(config.PARSE_APP_ID, config.PARSE_REST_API_KEY);

describe('utils', function() {
  it('can stringify param values', function() {
    var params = {
      where: { score: {"$exists": false}},
      order: 'name'
    };
    var stringified = parse.stringifyParamValues(params);
    var expected = {
      where: '{"score":{"$exists":false}}',
      order: 'name'
    };
    stringified.should.eql(expected);
  });
});

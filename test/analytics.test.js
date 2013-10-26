var config = require('./config');
var should = require('should');
var Kaiseki = require('../lib/kaiseki');

var parse = new Kaiseki(config.PARSE_APP_ID, config.PARSE_REST_API_KEY);

describe('analytics', function() {
	var updatetime = {
		at: {
	    	__type: 'Date',
	        iso: "2013-10-25T21:23:19Z"
	     }
	 };
	it ('can update app opened', function(done) {
		parse.appOpened(updatetime, function(err, res, body, success) {
			success.should.be.true;
			should.not.exist(err);
			should.exist(res);
			should.exist(body);
			done();
		});
	});	
});
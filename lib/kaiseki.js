
var request = require('request');
var _ = require('underscore');

var Kaiseki = function(applicationId, restAPIKey) {
  this.applicationId = applicationId;
  this.restAPIKey = restAPIKey;
};

Kaiseki.prototype = {
  API_BASE_URL: 'https://api.parse.com',

  applicationId: null,
  restAPIKey: null,

  getObjects: function(className, objectId, params, callback) {
    if (_.isFunction(params)) {
      callback = params;
      params = null;
    }
    var url = '/1/classes/' + className + '/' + objectId;
    this._request('GET', url, params, callback);
  },

  getUsers: function(objectId, params, callback) {
    if (_.isFunction(params)) {
      callback = params;
      params = null;
    }
    var url = '/1/users/' + objectId;
    this._request('GET', url, params, callback);
  },

  _request: function(method, url, params, callback) {
    url = this.API_BASE_URL + url;
    var options = {
      method: method,
      headers: {
        'X-Parse-Application-Id': this.applicationId,
        'X-Parse-REST-API-Key': this.restAPIKey
      }
    };
    if (params) {
      var key = 'qs';
      if (method == 'POST')
        key = 'json';
      options[key] = params;
    }

    request(url, options, callback);
  }
};

module.exports = Kaiseki;
/*!
 * Kaiseki
 * Copyright(c) 2012 BJ Basañes / Shiki (shikishiji@gmail.com)
 * MIT Licensed
 */


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

  createObject: function(className, data, callback) {
    var url = '/1/classes/' + className;
    var wrap = function(err, res, body) {
      if (!err)
        body = _.extend({}, data, body);
      callback(err, res, body);
    };
    this.request('POST', url, data, wrap);
  },

  getObject: function(className, objectId, params, callback) {
    if (_.isFunction(params)) {
      callback = params;
      params = null;
    }
    var wrap = function(err, res, body) {
      if (!err)
        body = JSON.parse(body);
      callback(err, res, body);
    };
    var url = '/1/classes/' + className + '/' + objectId;
    this.request('GET', url, params, wrap);
  },

  updateObject: function(className, objectId, data, callback) {
    var url = '/1/classes/' + className + '/' + objectId;
    this.request('PUT', url, data, callback);
  },

  deleteObject: function(className, objectId, callback) {
    var url = '/1/classes/' + className + '/' + objectId;
    this.request('DELETE', url, null, callback);
  },

  getObjects: function(className, params, callback) {
    if (_.isFunction(params)) {
      callback = params;
      params = null;
    } else {
      params = this.stringifyParamValues(params);
    } 
    var wrap = function(err, res, body) {
      if (!err && res.statusCode === 200)
        body = JSON.parse(body).results;
      callback(err, res, body);
    };
    var url = '/1/classes/' + className;
    this.request('GET', url, params, wrap);
  },

  getUsers: function(objectId, params, callback) {
    if (_.isFunction(params)) {
      callback = params;
      params = null;
    }
    var url = '/1/users/' + objectId;
    this.request('GET', url, params, callback);
  },

  stringifyParamValues: function(params) {
    if (!params || _.isEmpty(params))
      return null;
    var values = _(params).map(function(value, key) {
      if (_.isObject(value) || _.isArray(value))
        return JSON.stringify(value);
      else
        return value;
    });
    var keys = _(params).keys();
    var ret = {};
    for (var i = 0; i < keys.length; i++)
      ret[keys[i]] = values[i];
    return ret;
  },

  request: function(method, url, params, callback) {
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
      if (method === 'POST' || method === 'PUT')
        key = 'json';
      options[key] = params;
    }

    request(url, options, callback);
  }
};

module.exports = Kaiseki;
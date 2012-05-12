/*!
 * Kaiseki
 * Copyright(c) 2012 BJ Basañes / Shiki (shikishiji@gmail.com)
 * MIT Licensed
 *
 * See the README.md file for documentation.
 */


var request = require('request');
var _ = require('underscore');

var Kaiseki = function(applicationId, restAPIKey, sessionToken) {
  this.applicationId = applicationId;
  this.restAPIKey = restAPIKey;
  this.sessionToken = _.isUndefined(sessionToken) ? null : sessionToken;
};

Kaiseki.prototype = {
  API_BASE_URL: 'https://api.parse.com',

  applicationId: null,
  restAPIKey: null,
  sessionToken: null,

  createUser: function(data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/users',
      params: data,
      callback: function(err, res, body, success) {
        if (!err)
          body = _.extend({}, data, body);
        callback(err, res, body, success);
      }
    });
  },

  getUser: function(objectId, params, callback) {
    this._jsonRequest({
      url: '/1/users/' + objectId,
      params: _.isFunction(params) ? null : params,
      callback: _.isFunction(params) ? params : callback
    });
  },

  loginUser: function(username, password, callback) {
    this._jsonRequest({
      url: '/1/login',
      params: {
        username: username,
        password: password
      },
      callback: callback
    });
  },

  updateUser: function(objectId, data, callback) {
    this._jsonRequest({
      method: 'PUT',
      url: '/1/users/' + objectId,
      params: data,
      callback: callback
    });
  },

  deleteUser: function(objectId, callback) {
    this._jsonRequest({
      method: 'DELETE',
      url: '/1/users/' + objectId,
      callback: callback
    });
  },

  getUsers: function(params, callback) {
    this._jsonRequest({
      url: '/1/users',
      params: _.isFunction(params) ? null : params,
      callback: _.isFunction(params) ? params : callback
    });
  },

  createObject: function(className, data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/classes/' + className,
      params: data,
      callback: function(err, res, body, success) {
        if (!err)
          body = _.extend({}, data, body, success);
        callback(err, res, body, success);
      }
    });
  },

  getObject: function(className, objectId, params, callback) {
    this._jsonRequest({
      url: '/1/classes/' + className + '/' + objectId,
      params: _.isFunction(params) ? null : params,
      callback: _.isFunction(params) ? params : callback
    });
  },

  updateObject: function(className, objectId, data, callback) {
    this._jsonRequest({
      method: 'PUT',
      url: '/1/classes/' + className + '/' + objectId,
      params: data,
      callback: callback
    });
  },

  deleteObject: function(className, objectId, callback) {
    this._jsonRequest({
      method: 'DELETE',
      url: '/1/classes/' + className + '/' + objectId,
      callback: callback
    });
  },

  getObjects: function(className, params, callback) {
    this._jsonRequest({
      url: '/1/classes/' + className,
      params: _.isFunction(params) ? null : params,
      callback: _.isFunction(params) ? params : callback
    });
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

  _jsonRequest: function(opts) {
    opts = _.extend({
      method: 'GET',
      url: null,
      params: null,
      callback: null
    }, opts);

    var reqOpts = {
      method: opts.method,
      headers: {
        'X-Parse-Application-Id': this.applicationId,
        'X-Parse-REST-API-Key': this.restAPIKey
      }
    };
    if (this.sessionToken)
      reqOpts.headers['X-Parse-Session-Token'] = this.sessionToken;
    if (opts.params) {
      if (opts.method == 'GET')
        opts.params = this.stringifyParamValues(opts.params);
    
      var key = 'qs';
      if (opts.method === 'POST' || opts.method === 'PUT')
        key = 'json';
      reqOpts[key] = opts.params;
    }

    request(this.API_BASE_URL + opts.url, reqOpts, function(err, res, body) {
      var success = !err && (res.statusCode === 200 || res.statusCode === 201);
      if (res.headers['content-type'].toLowerCase().indexOf('application/json') >= 0) {
        if (!_.isObject(body) && !_.isArray(body)) // just in case it's been parsed already
          body = JSON.parse(body);
        if (body.error)
          success = false;
        else if (body.results && _.isArray(body.results))
          body = body.results;
      }
      opts.callback(err, res, body, success);
    });
  }
};

module.exports = Kaiseki;
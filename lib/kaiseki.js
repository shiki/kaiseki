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
  this.masterKey = null;
  this.sessionToken = _.isUndefined(sessionToken) ? null : sessionToken;
};

Kaiseki.prototype = {
  API_BASE_URL: 'https://api.parse.com',

  applicationId: null,
  restAPIKey: null,
  masterKey: null, // required for deleting files
  sessionToken: null,

  createUser: function(data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/users',
      params: data,
      callback: function(err, res, body, success) {
        if (!err && success)
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

  // Also used for validating a session token
  // https://parse.com/docs/rest#users-validating
  getCurrentUser: function(callback) {
    this._jsonRequest({
      url: '/1/users/me',
      callback: callback
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

  requestPasswordReset: function(email, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/requestPasswordReset',
      params: {'email': email},
      callback: callback
    });
  },

  createObjects: function(className, data, callback) {
    var requests = [];
    for (var i = 0; i < data.length; i++) {
      requests.push({
        'method': 'POST',
        'path': '/1/classes/' + className,
        'body': data[i]
      });
    }
    this._jsonRequest({
      method: 'POST',
      url: '/1/batch/',
      params: {
        requests: requests
      },
      callback: function(err, res, body, success) {
        if (!err && success)
          body = _.extend({}, data, body);
        callback(err, res, body, success);
      }
    });
  },

  createObject: function(className, data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/classes/' + className,
      params: data,
      callback: function(err, res, body, success) {
        if (!err && success)
          body = _.extend({}, data, body);
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

  updateObjects: function(className, updates, callback) {
    var requests = [],
        update = null;
    for (var i = 0; i < updates.length; i++) {
      update = updates[i];
      requests.push({
        'method': 'PUT',
        'path': '/1/classes/' + className + '/' + update.objectId,
        'body': update.data
      });
    }
    this._jsonRequest({
      method: 'POST',
      url: '/1/batch/',
      params: {
        requests: requests
      },
      callback: callback 
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

  countObjects: function(className, params, callback) {
    var paramsMod = params;

    if (_.isFunction(params)) {
      paramsMod = {};
      paramsMod['count'] = 1;
      paramsMod['limit'] = 0;
    } else {
      paramsMod['count'] = 1;
      paramsMod['limit'] = 0;
    }

    this._jsonRequest({
      url: '/1/classes/' + className,
      params: paramsMod,
      callback: _.isFunction(params) ? params : callback
    });
  },

  createRole: function(data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/roles',
      params: data,
      callback: function(err, res, body, success) {
        if (!err && success)
          body = _.extend({}, data, body);
        callback(err, res, body, success);
      }
    });
  },

  getRole: function(objectId, params, callback) {
    this._jsonRequest({
      url: '/1/roles/' + objectId,
      params: _.isFunction(params) ? null : params,
      callback: _.isFunction(params) ? params : callback
    });
  },

  updateRole: function(objectId, data, callback) {
    this._jsonRequest({
      method: 'PUT',
      url: '/1/roles/' + objectId,
      params: data,
      callback: callback
    });
  },

  deleteRole: function(objectId, callback) {
    this._jsonRequest({
      method: 'DELETE',
      url: '/1/roles/' + objectId,
      callback: callback
    });
  },

  getRoles: function(params, callback) {
    this._jsonRequest({
      url: '/1/roles',
      params: _.isFunction(params) ? null : params,
      callback: _.isFunction(params) ? params : callback
    });
  },

  uploadFile: function(filePath, fileName, callback) {
    if (_.isFunction(fileName)) {
      callback = fileName;
      fileName = null;
    }

    var contentType = require('mime').lookup(filePath);
    if (!fileName)
      fileName = filePath.replace(/^.*[\\\/]/, ''); // http://stackoverflow.com/a/423385/246142
    var buffer = require('fs').readFileSync(filePath);
    this.uploadFileBuffer(buffer, contentType, fileName, callback);
  },

  uploadFileBuffer: function(buffer, contentType, fileName, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/files/' + fileName,
      body: buffer,
      headers: { 'Content-type': contentType },
      callback: callback
    });
  },

  deleteFile: function(name, callback) {
    this._jsonRequest({
      method: 'DELETE',
      url: '/1/files/' + name,
      callback: callback
    });
  },

  sendPushNotification: function(data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/push',
      params: data,
      callback: function(err, res, body, success) {
        if (!err && success)
          body = _.extend({}, data, body);

        callback.apply(this, arguments);
      }
    });
  },

  sendAnalyticsEvent: function(eventName, dimensionsOrCallback, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/events/' + eventName,
      params: _.isFunction(dimensionsOrCallback) ? {} : dimensionsOrCallback,
      callback: _.isFunction(dimensionsOrCallback) ? dimensionsOrCallback : callback
    });
  },
  
  cloudRun: function(functionName, data, callback) {
    this._jsonRequest({
      method: 'POST',
      url: '/1/functions/' + functionName,
      params: data,
      callback: function(err, res, body, success) {
        if (!err && success)
          body = _.extend({}, data, body);
        callback(err, res, body, success);
      }
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
      body: null,
      headers: null,
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
    if (this.masterKey)
      reqOpts.headers['X-Parse-Master-Key'] = this.masterKey;
    if (opts.headers)
      _.extend(reqOpts.headers, opts.headers);

    if (opts.params) {
      if (opts.method == 'GET')
        opts.params = this.stringifyParamValues(opts.params);

      var key = 'qs';
      if (opts.method === 'POST' || opts.method === 'PUT')
        key = 'json';
      reqOpts[key] = opts.params;
    } else if (opts.body) {
      reqOpts.body = opts.body;
    }

    request(this.API_BASE_URL + opts.url, reqOpts, function(err, res, body) {
      var isCountRequest = opts.params && !_.isUndefined(opts.params['count']) && !!opts.params.count;
      var success = !err && (res.statusCode === 200 || res.statusCode === 201);
      if (res && res.headers['content-type'] && 
        res.headers['content-type'].toLowerCase().indexOf('application/json') >= 0) {
        if (!_.isObject(body) && !_.isArray(body)) // just in case it's been parsed already
          body = JSON.parse(body);
        if (body.error) {
          success = false;
        } else if (body.results && _.isArray(body.results) && !isCountRequest) {
          // If this is a "count" request. Don't touch the body/result.
          body = body.results;
        }
      }
      opts.callback(err, res, body, success);
    });
  }
};

module.exports = Kaiseki;

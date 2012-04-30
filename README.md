Kaiseki
=============

A Parse.com [REST API](https://parse.com/docs/rest) client for Node.js

Installing
-------------

I'll post this to npm later. For now, you can include this in your `package.json` as a Git reference:

    "dependencies": {
      "kaiseki": "git+ssh://git@github.com:shiki/kaiseki.git",
      ...
    }

Or you can just download the files and put it in your project.

Documentation
-------------

### Setup

    // the class
    var Kaiseki = require('kaiseki');

    // instantiate
    var APP_ID = '<your-Parse-application-id>';
    var REST_API_KEY = '<your-Parse-REST-API-key>';
    var kaiseki = new Kaiseki(APP_ID, REST_API_KEY);

    // use it
    kaiseki.getObjects(...);

### Callbacks

All callbacks should follow this format: `function(error, response, body) { ... }`. This is because 
Kaiseki is based on [Request](https://github.com/mikeal/request) and I thought it would be best
to pass the same callback parameters. The `error` and `response` parameters are passed as is. On most
methods, `body` is changed and parsed from JSON for your convenience.

* `error`: If there's an error during the request, this will not be empty. Note that if the API returns
a `statusCode` that is not `200` or `201`, it is not marked as an error.
* `response`: You can check lots of info about the request in here. For example, `response.statusCode`.
* `body`: This will be an object or array, depending on the method called.


### Users

#### `createUser (data, callback)`

This will pass to `body` whatever you passed in `data` plus the returned `createdAt` and `sessionToken` fields.

    var userInfo = {
      // required
      username: 'maricris', 
      password: 'whew',

      name: 'Maricris',
      gender: 'female',
      nickname: 'Kit'
    };

    kaiseki.createUser(userInfo, function(err, res, body) {
      console.log('user created with session token = ', body.sessionToken);
      console.log('object id = ', body.objectId);
    });

### `getUser (objectId, params, callback)`

Gets a user info based on the `objectId` (user id). The `params` is currently unused but is there for a
future use. You can pass in the callback function as the second parameter. 

    kaiseki.getUser('<object-id>', function(err, res, body) {
      console.log('user info = ', body);
    });

### `loginUser (username, password, callback)`

Log in a user. This will give you a user's `sessionToken` that you can use in `updateUser` and `deleteUser`, and other API calls that may need a `sessionToken`.

    kaiseki.loginUser('username', 'my secret password', function(err, res, body) {
      console.log('user logged in with session token = ', body.sessionToken);
    });

### `updateUser (objectId, data, callback)`

Updates a user object (if that wasn't obvious). This requires a sessionToken received from `loginUser` or `createUser`. If successful, body will contain the `updatedAt` value.

    kaiseki.sessionToken = 'le session token';
    kaiseki.updateUser({name: 'new name'}, function(err, res, body) {
      console.log('updated at = ', body.updatedAt);
    });

### `deleteUser (objectId, data, callback)`

Deletes a user. Like `updateUser()`, this needs a `sessionToken`. 

    kaiseki.sessionToken = 'le session token';
    kaiseki.deleteUser('<object-id>', function(err, res, body) {
      if (res.statusCode == 200)
        console.log('deleted!');
      else
        console.log('failed!');
    });

### `getUsers (params, callback)`

Returns a list of users. The `params` parameter can be an object containing the query options as described [here](https://parse.com/docs/rest#queries-basic). Note that unlike the Parse API Doc, you do not have to pass in a string as the values. This is all taken of for you. 

If you do not want to pass in some query parameters, you can set the callback as the first parameter.

The `body` in the callback is an array of the returned objects.

    // get all users (no parameters)
    kaiseki.getUsers(function(err, res, body) {
      console.log('all users = ', body);
    });

    // query with parameters
    var params = {
      here: { gender: "female" },
      order: '-name'
    };
    kaiseki.getUsers(params, function(err, res, body) {
      console.log('female users = ', body);
    });

### `createObject (className, data, callback)`

### `getObject (className, objectId, params, callback)`

### `updateObject (className, objectId, data, callback)`

### `deleteObject (className, objectId, callback)`

### `getObjects (className, params, callback)`

Tests
-------------
The tests use [mocha](http://visionmedia.github.com/mocha/) and have to be run on an empty Parse application. Please provide your own API keys in `test/config.js`. To run the test:

    make mocha


Notes
-------------
Not all API endpoints are currently implemented. They are Files, Push Notifications, and GeoPoints. If you'd like to contribute, please fork ^_^x


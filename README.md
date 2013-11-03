Kaiseki
=============

A Parse.com [REST API](https://parse.com/docs/rest) client for Node.js



Installing
-------------

 * Install through npm:

        npm install kaiseki

 * Or in your `package.json`:

        "dependencies": {
          "kaiseki": "*",
          ...
        }
 Then:

        npm install

 * Or you can just download the files and put it in your project.



Usage
-------------

You might want to read about the [REST API](https://parse.com/docs/rest) first before diving in.

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

All callbacks should follow this format: `function(error, response, body, success) { ... }`. This is because Kaiseki is based on [Request](https://github.com/mikeal/request) and I thought it would be best to pass the same callback parameters. The `error` and `response` parameters are passed as is. On most methods, `body` is changed and parsed from JSON for your convenience.

 * __error__: If there's an error during the request (e.g. no internet connection), this will not be empty. Note that if the API returns a `statusCode` that is not `2xx`, it is not marked as an error.

 * __response__: You can check lots of info about the request in here. For example, the REST API will return a `response.statusCode` value of `4xx` on failures. In these cases, the API will still return a JSON object containing the fields `code` and `error`. You can get this in the `body` parameter.

        { "code": 105,
          "error": "invalid field name: bl!ng" }

 Read more about the Response format [here](https://parse.com/docs/rest#general-responses).

 * __body__: On successful requests, this will be an object or array depending on the method called.

 * __success__: A convenience parameter, this is a boolean indicating if the request was a success.


### Users

#### createUser (data, callback)

This will pass to `body` whatever you passed in `data` plus the returned `createdAt` and `sessionToken` fields.

    var userInfo = {
      // required
      username: 'maricris',
      password: 'whew',

      name: 'Maricris',
      gender: 'female',
      nickname: 'Kit'
    };

    kaiseki.createUser(userInfo, function(err, res, body, success) {
      console.log('user created with session token = ', body.sessionToken);
      console.log('object id = ', body.objectId);
    });

#### getUser (objectId, params, callback)

Gets a user info based on the `objectId` (user id). The `params` is currently unused but is there for a
future use. You can pass in the callback function as the second parameter.

    kaiseki.getUser('<object-id>', function(err, res, body, success) {
      console.log('user info = ', body);
    });

#### loginUser (username, password, callback)

Log in a user. This will give you a user's `sessionToken` that you can use in `updateUser` and `deleteUser`, and other API calls that may need a `sessionToken`.

    kaiseki.loginUser('username', 'my secret password', function(err, res, body, success) {
      console.log('user logged in with session token = ', body.sessionToken);
    });

#### updateUser (objectId, data, callback)

Updates a user object (if that wasn't obvious). This requires a sessionToken received from `loginUser` or `createUser`. If successful, body will contain the `updatedAt` value.

    kaiseki.sessionToken = 'le session token';
    kaiseki.updateUser({name: 'new name'}, function(err, res, body, success) {
      console.log('updated at = ', body.updatedAt);
    });

#### deleteUser (objectId, data, callback)

Deletes a user. Like `updateUser()`, this needs a `sessionToken`.

    kaiseki.sessionToken = '<user-seassion-token>';
    kaiseki.deleteUser('<object-id>', function(err, res, body, success) {
      if (success)
        console.log('deleted!');
      else
        console.log('failed!');
    });

#### getUsers (params, callback)

Returns an array of users. The `params` parameter can be an object containing the query options as described [here](https://parse.com/docs/rest#queries-basic). Note that unlike the Parse API Doc, you do not have to pass in strings for the parameter values. This is all taken care of for you.

If you do not want to pass in some query parameters, you can set the callback as the first parameter.

The `body` in the callback is an array of the returned objects.

    // get all users (no parameters)
    kaiseki.getUsers(function(err, res, body, success) {
      console.log('all users = ', body);
    });

    // query with parameters
    var params = {
      where: { gender: "female" },
      order: '-name'
    };
    kaiseki.getUsers(params, function(err, res, body, success) {
      console.log('female users = ', body);
    });

#### requestPasswordReset (email, callback)

Just provide an email and this function will send the user an email to reset their password

    kaiseki.requestPasswordReset('email@mail.com', function(err, res, body, success) {
      if (success) {
        console.log('Successfully Sent Password Reset');
      } else {
        console.log('Error: ', err, body);
      }
    });

### Objects

Object methods are similar to the User methods except that Object methods require you to specify the Parse class name. Class names are generally passed as the first parameter.

#### createObject (className, data, callback)

Creates an object and passes to `body` whatever you passed in `data` plus the returned `createdAt` field.

    var dog = {
      name: 'Prince',
      breed: 'Pomeranian'
    };
    var className = 'Dogs';

    kaiseki.createObject(className, dog, function(err, res, body, success) {
      console.log('object created = ', body);
      console.log('object id = ', body.objectId);
    });

#### getObject (className, objectId, params, callback)

Gets an object based on the `objectId`.

The `params` parameter can be an object containing the query options as described [here](https://parse.com/docs/rest#queries-basic). Note that unlike the Parse API Doc, you do not have to pass in strings for the parameter values. This is all taken care of for you.

If you do not want to pass in some query parameters, you can set the callback as the second parameter.

    // query with parameters
    var params = {
      where: { breed: "Chow Chow" },
      order: '-name'
    };
    kaiseki.getObject('<class-name>', '<object-id>', params, function(err, res, body, success) {
      console.log('found object = ', body);
    });

#### updateObject (className, objectId, data, callback)

Updates an object. If successful, body will contain the `updatedAt` value.

    kaiseki.updateObject('<class-name>', '<object-id>',
      {name: 'new object name'},
      function(err, res, body, success) {

      console.log('object updated at = ', body.updatedAt);
    });

#### deleteObject (className, objectId, callback)

Deletes an object.

    kaiseki.deleteObject('<class-name>', '<object-id>', function(err, res, body, success) {
      if (success)
        console.log('deleted!');
      else
        console.log('failed!');
    });

#### getObjects (className, params, callback)

Returns an array of objects in the class name. The `params` parameter can be an object containing the query options as described [here](https://parse.com/docs/rest#queries-basic). Note that unlike the Parse API Doc, you do not have to pass in strings for the parameter values. This is all taken care of for you.

If you do not want to pass in some query parameters, you can set the callback as the first parameter.

The `body` in the callback is an array of the returned objects.

    // get all objects (no parameters)
    kaiseki.getObjects('Dogs', function(err, res, body, success) {
      console.log('all dogs = ', body);
    });

    // query with parameters
    var params = {
      where: { breed: "Chow Chow" },
      order: '-name'
    };
    kaiseki.getObjects('Dogs', params, function(err, res, body, success) {
      console.log('Chow chow dogs = ', body);
    });

##### Using `count` with `getObjects`.

You are allowed to pass in the `count` parameter when using `getObjects`. If you do, the value of `body` will be an object with the properties `results` and `count`. The `results` property contains the objects resulting from the query. See more about counting [here](https://parse.com/docs/rest#queries-counting). If you only need `count`, you may also use the helper method `countObjects`. Using `getObjects` for counting has the advantage of querying for a _limited_ list of objects and getting the total possible objects that can be queried at the same time.

    // Get 10 objects, but also return the total number of objects
    var params = {
      where: { breed: "Chow Chow" },
      limit: 10,
      count: true
    };
    kaiseki.getObjects('Dogs', params, function(err, res, body, success) {
      console.log('The first 10 Chow chow dogs = ', body.results);
      console.log('Total number of Chow chow dogs = ', body.count);
    });

#### countObjects (className, params, callback)

Same as getObjects but returns a count in the `body.count` parameter without returning any objects.

    // count all objects (no parameters)
    kaiseki.countObjects('Dogs', function(err, res, body, success) {
      console.log('number of dogs = ', body.count);
    });

    // query with parameters
    var params = {
      where: { breed: "Chow Chow" },
      order: '-name'
    };
    kaiseki.getObjects('Dogs', params, function(err, res, body, success) {
      console.log('Number of Chow chow dogs = ', body.count);
    });

### Roles

Role methods are similar to the Object methods except that they don't require you to use a classname.

#### createRole (data, callback)

Creates a role and passes to `body` whatever you passed in `data` plus the returned `createdAt` field. You can only create a role if you provide the `kaiseki.masterKey` property.

    var data = {
      name: 'Administrator',
      ACL: {
          "*": {
            "read": true
          }
        },
      roles: {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": <role-id>
            }
          ]
        },
      users: {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": <user-id>
            }
          ]
        }
    };

    kaiseki.createRole(data, function(err, res, body, success) {
      console.log('role created = ', body);
      console.log('object id = ', body.objectId);
    });

#### getRole (objectId, params, callback)

Gets a role based on the `objectId`. The `params` is currently unused but is there for a future use. You can pass in the callback function as the second parameter.

    kaiseki.getRole('<object-id>', function(err, res, body, success) {
      console.log('found role = ', body);
    });

#### updateRole (objectId, data, callback)

Updates a role. If successful, body will contain the `updatedAt` value. You can only update a role if you provide the `kaiseki.masterKey` property or the `kaiseki.sessionToken` property and if that user has write access to the role.

    var data = {
      users: {
          "__op": "RemoveRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": <user-id>
            }
          ]
        }
    };

    kaiseki.updateRole('<role-object-id>', data, function(err, res, body, success) {
      console.log('role updated at = ', body.updatedAt);
    });

#### deleteRole (objectId, callback)

Deletes a role. The REST API does not return anything in the body so it's best to check for `success` if the operation was successful. You can only delete a role if you provide the `kaiseki.masterKey` property or the `kaiseki.sessionToken` property and if that user has write access to the role.

    kaiseki.deleteRole('<object-id>', function(err, res, body, success) {
      if (success)
        console.log('deleted!');
      else
        console.log('failed!');
    });

#### getRoles (params, callback)

Returns an array of roles. The `params` parameter can be an object containing the query options as described [here](https://parse.com/docs/rest#queries-basic). Note that unlike the Parse API Doc, you do not have to pass in strings for the parameter values. This is all taken care for you.

If you do not want to pass in some query parameters, you can set the callback as the first parameter.

The `body` in the callback is an array of the returned roles.

    // get all objects (no parameters)
    kaiseki.getRoles(function(err, res, body, success) {
      console.log('all roles = ', body);
    });

    // query with parameters
    var params = {
      where: { name: "Administrator" }
    };
    kaiseki.getRoles(params, function(err, res, body, success) {
      console.log('Administrator Role = ', body);
    });

### Files

#### uploadFile (filePath, fileName, callback)

Upload a local file. Specifying `fileName` is optional. If successful, the `body` result will contain the Parse `name` and `url` of the file. The value of `name` is what you will use for associating a Parse file to an object.

    var localFilePath = __dirname + '/images/apple.jpg';
    kaiseki.uploadFile(localFilePath, function(err, res, body, success) {
      console.log('uploaded file url:', body.url);
      console.log('uploaded file name:', body.name);
    });

#### uploadFileBuffer (buffer, contentType, fileName, callback)

This is a more specific upload utility. You can specify the buffer or string to be used as the upload data. The `body` result is still the same as `uploadFile()`.

    var buffer = require('fs').readFileSync(localFilePath);
    kaiseki.uploadFileBuffer(buffer, 'image/jpeg', 'orange.jpg', function(err, res, body, success) {
      console.log('uploaded file details', body);
    });

Uploading a string as a text file:

    var buffer = 'my text file contents';
    kaiseki.uploadFileBuffer(buffer, 'text/plain', 'readme.txt', function(err, res, body, success) {
      console.log('uploaded file details', body);
    });

#### deleteFile (name, callback)

Deleting files require the Parse API master key. The value of `name` should be the name generated by Parse during upload.

    kaiseki.masterKey = 'your-api-master-key';
    var parseFileName = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-files.apple.jpg';
    kaiseki.deleteFile(parseFileName, function(err, res, body, success) {
      // body is empty here
      if (success)
        console.log('successfully deleted file!');
    });

#### Associating Files with Objects

Once you have the Parse file `name` after calling `uploadFile()` or `uploadFileBuffer()`, you can attach it to an object by simple setting a `"File"` data type to a property. More info [here](https://parse.com/docs/rest#files-associating).

    var parseFileName = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-files.apple.jpg';
    var apple = {
      name: 'Apple',
      rotten: true,
      photo: {
        name: parseFileName,
        __type: 'File'
      }
    };
    kaiseki.createObject('Fruits', apple, function(err, res, body, success) {
      if (success)
        console.log('created an apple object with image');
    });

Associating a file to an existing object:

    var orange = {
      photo: {
        name: parseFileName,
        __type: 'File'
      }
    };
    kaiseki.updateObject('Fruits', '<the-object-id>', orange, function(err, res, body, success) {
      if (success)
        console.log('attached photo to an object');
    });

### Push Notifications

#### sendPushNotification (data, callback)

Send a push notification. The `data` parameter has to follow the data structure as described in the [Parse REST API](https://www.parse.com/docs/rest#push). The following code sample sends a notification to the broadcast channel (all devices) on all platforms (iOS and Android).

*Please note:* For push notifications to work you have to configure your Parse app accordingly. Use the _Settings > Push_ section of your app's dashboard.

    var notification = {
      channels: [''],
      data: {
        alert: "Tune in for the World Series, tonight at 8pm EDT"
      }
    };

    kaiseki.sendPushNotification(notification, function(err, res, body, success) {
      if (success) {
        console.log('Push notification successfully sent:', body);
      } else {
        console.log('Could not send push notification:', err);
      }
    });

### GeoPoints

You can set [GeoPoints](https://parse.com/docs/rest#geo) by simply setting a `"GeoPoint"` data type to a property named `"location"`.

    var place = {
      name: 'Tokyo Coffee Shop',
      location: {
        __type: 'GeoPoint',
        latitude: 40.0,
        longitude: -30.0
      }
    };
    kaiseki.createObject('Places', place, function(err, res, body, success) {
      if (success)
        console.log('Created a place with a GeoPoint.');
    });

### Analytics

You can use the [Analytics API](https://parse.com/docs/rest#analytics) to send analytic events happening in your app.

To record an _AppOpened_ event use it like this.

    kaiseki.sendAnalyticsEvent('AppOpened', function(err, res, body, success) {
      // do nothing
    });

To record a custom event, let's say _Search_, use it like this.

    kaiseki.sendAnalyticsEvent('Search', {
      'priceRange': '1000-1500',
      'source': 'craigslist',
      'dayType': 'weekday'
    }, function(err, res, body, success) {
      // do nothing
    );

Tests
-------------
The tests use [mocha](http://visionmedia.github.com/mocha/) and have to be run on an empty Parse application. Please provide your own API keys in `test/config.js`. To run the test:

    make mocha




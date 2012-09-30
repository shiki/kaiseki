# Kaiseki Changelog

### 0.4.0 (September 30, 2012)

 * Support for request password (by [@programmerdave](https://github.com/programmerdave)).
 * Support for push notifications (by [@gonecoding](https://github.com/gonecoding)).
 * `countObjects` method (by [@programmerdave](https://github.com/programmerdave)).
 * **CHANGE**: The methods `createUser`, `createObject`, and `createRole` should only return the error and code when the request fails. Previous behavior was like this: if a Parse-related error occurs in `createUser`, the `body` in the callback will contain the submitted data as well as `error` and `code`. Now, only `error` and `code` will be returned.

### 0.3.2 (September 5, 2012)

 * Using `count` in `getObjects` will now return the full object response from Parse. The `body` will contain `results` and `count` properties.

### 0.3.1 (July 26, 2012)

 * **FIX**: for "TypeError: Cannot read property 'headers' of undefined".

### 0.3.0 (June 24, 2012)

 * Support for Roles (by [@programmerdave](https://github.com/programmerdave)).

### 0.2.0 (May 20, 2012)

 * Uploading and deletion of files.
 * **FIX**: Improved request handling. Previously, HTML results may be incorrectly parsed as JSON.

### 0.1.0 (May 1, 2012)

 * First version. Supports objects and users.


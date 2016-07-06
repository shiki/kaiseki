// Example express application adding the parse-server module to expose Parse
// compatible API routes.
'use strict';
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const config = require('../config.js');
const port = 1337;
const attr = {
    databaseURI: 'mongodb://localhost:27017/dev',
    appId: config.applicationId,
    masterKey: 'myMasterKey', //Add your master key here. Keep it secret!
    serverURL: 'http://localhost:' + port + config.mountPath,
};
console.log(attr);
var api = new ParseServer(attr);
var app = express();
app.use(config.mountPath, api);
app.post('/shutdown', function (req, res) {
    res.send('bye~\n');
    process.exit(0);
});
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('running on port ' + port + '.');
    console.log('mount path', config.mountPath, '.');
});


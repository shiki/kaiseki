/**
 * Global hooks for running a Mongodb server and a Parse server
 */

const forever = require('forever-monitor');

before(require('mongodb-runner/mocha/before')({timeout: 30000}));
after(require('mongodb-runner/mocha/after'));

var parseServer;

before((done) => {
  parseServer = new forever.Monitor('test/parse-server/index.js', {
    max: 1,
    silent: true
  });
  parseServer.on('error', err => {
    done(err);
  });
  parseServer.on('stdout', (data) => {
    let stdout = data.toString('utf8');
    if (stdout.startsWith('running on port')) {
      done();
    }
  });
  parseServer.start();
});

after(() => {
  parseServer.stop();
});

let Mocha = require('mocha'),
       fs = require('fs'),
     path = require('path');

let mocha = new Mocha({timeout: 30000});

let testDir = './test'

mocha.addFile(testDir + '/global.js');

fs.readdirSync(testDir).filter(file => {
  return file.substr(-8) === '.test.js';
}).forEach(file => {
  mocha.addFile(path.join(testDir, file));
});

mocha.run(failures => {
  process.on('exit', () => {
    process.exit(failures);  // exit with non-zero status if there were failures
  });
});

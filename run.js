const logger   = require('./Snaildom/Utils/Logger');
const config   = require('./config');
const ver      = require('./package').version;

const Server   = require('./Snaildom/Server');
const memwatch = require('node-memwatch');

const worldId  = Number(process.argv[2]);
const world    = config.servers[worldId];

console.log('Snaildom v' + ver + ' - a backend for damen\'s snaildom by jackie#9307\n');

if(world)
  new Server(world);
else
  logger.fatal('Invalid world. Please run the server with a valid world id.', true, false);


memwatch.on('leak', info => {
  logger.warn('Memory leak detected!');

  console.log(info);
});
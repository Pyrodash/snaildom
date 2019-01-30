const logger = require('./Snaildom/Utils/Logger');
const config = require('./config');
const ver    = require('./package').version;

const Server = require('./Snaildom/Server');

const worldId = Number(process.argv[2]);
const world   = config.servers[worldId];

console.log('Snaildom v' + ver + ' - a backend for damen\'s snaildom by Jackie#9307\n');

if(world)
  new Server(world);
else
  logger.fatal('Invalid world. Please use run the server with a valid world id.', true, false);
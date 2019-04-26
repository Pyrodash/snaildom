const config  = require('./config');
const colors  = require('colors');
const ver     = require('./package').version;

const Server  = require('./Snaildom/Server');

const worldId = Number(process.argv[2]);
const world   = config.servers[worldId];

console.log('Snaildom v' + ver + ' - a backend for damen\'s snaildom by jackie#9307\n');

if(world) {
  const server = new Server(world);

  async function handleShutdown() {
    try {
      await server.logger.saveLoop();
      await server.updateInfo(true);
    } catch(err) {
      server.logger.error(err.stack);
      process.exit(1);
    }

    server.server.close();
    server.logger.warn('Shutting down...');

    process.exit(0);
  }

  process.on('SIGINT', handleShutdown.bind(this));
  process.on('SIGTERM', handleShutdown.bind(this));
} else
  console.error(colors.red('Invalid world. Please run the server with a valid world id.'));
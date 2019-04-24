const config  = require('./config');
const colors  = require('colors');
const ver     = require('./package').version;

const Server  = require('./Snaildom/Server');

const worldId = Number(process.argv[2]);
const world   = config.servers[worldId];

console.log('Snaildom v' + ver + ' - a backend for damen\'s snaildom by jackie#9307\n');

if(world)
  new Server(world);
else
  console.error(colors.red('Invalid world. Please run the server with a valid world id.'));
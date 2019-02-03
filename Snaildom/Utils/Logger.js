// A E S T H E T I C S

const utils  = require('./Utils');
const colors = require('colors');
const path   = require('path');
const fs     = require('fs');

var cache  = [];

setInterval(() => {
  const worldID = process.argv[2];
  const location = path.join(__dirname, '..', 'Logs', 'world-' + worldID + '.txt');

  if(cache.length == 0)
    return;

  fs.writeFile(location, cache.join('\n') + '\n', 'utf8', err => {
    if(err) {
      console.warn('Failed to save logs. What the fuck!');
      console.error(err);
    } else
      cache = [];
  });
}, 5 * 1000 * 60);
// Run save loop every 5 minutes

const logger = {
  format: function(level, data, prefix, color) {
    level = level.toUpperCase();
    var msg = '[' + level + ']';

    if(prefix)
      msg += '[' + prefix + ']';

    msg += ' > ';

    if(color && colors[color])
      msg = colors[color](msg);

    msg += data;

    return msg;
  },
  save: function(data) {
    const date = utils.logDate();
    data = '[' + date + ']  ' + data;

    cache.push(data);
  },
  write: function(data, prefix) {
    data = logger.format('info', data, prefix, 'green');

    console.log(data);
  },
  warn: function(data, prefix) {
    data = logger.format('warning', data, prefix, 'yellow');

    console.log(data);
    logger.save(data);
  },
  error: function(data, prefix) {
    if(data.stack)
      data = data.stack;

    data = logger.format('error', data, prefix, 'red');

    console.log(data);
    logger.save(data);
  },
  fatal: function(data, shutdown, alert, prefix) {
    data = logger.format('fatal', data, prefix, 'red');

    console.log(data);
    logger.save(data);

    if(typeof shutdown == 'string') {
      prefix = shutdown;

      shutdown = null;
      alert = null;
    }

    if(shutdown !== false) {
      if(alert !== false)
        logger.warn('Server shutting down...');

      process.exit();
    }
  }
};

module.exports = logger;
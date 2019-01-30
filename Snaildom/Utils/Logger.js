// A E S T H E T I C S

const colors = require('colors');

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
  write: function(data, prefix) {
    data = logger.format('info', data, prefix, 'green');

    console.log(data);
  },
  warn: function(data, prefix) {
    data = logger.format('warning', data, prefix, 'yellow');

    console.log(data);
  },
  error: function(data, prefix) {
    if(data.stack)
      data = data.stack;

    data = logger.format('error', data, prefix, 'red');

    console.log(data);
  },
  fatal: function(data, shutdown, alert, prefix) {
    logger.error(data);

    if(typeof shutdown == 'string') {
      prefix = shutdown;

      shutdown = null;
      alert = null;
    }

    if(shutdown !== false) {
      if(alert !== false) {
        logger.warn('Server shutting down...');
      }

      process.exit();
    }
  }
};

module.exports = logger;
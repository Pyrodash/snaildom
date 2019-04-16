'use strict';

const fs     = require('fs');

const utils  = require('./Utils');
const colors = require('colors');

class Logger {
  constructor(savePath, levels) {
    this.path = savePath;

    this.levels = [];
    this.cache = [];

    for(var level of levels) {
      this.createLevel(level);
    }

    this.interval = setInterval(this.saveLoop.bind(this), 5 * 60 * 1000)
  }

  saveLoop() {
    if(this.cache.length == 0) return;

    fs.writeFile(this.path, this.cache.join('\n') + '\n', 'utf8', err => {
      if(err) {
        console.warn('Failed to save logs. What the fuck!');
        console.error(err);
      } else
        this.log(null, 'Saved logs successfully.', { save: false });
    });
  }

  save(data) {
    data = '[' + utils.logDate() + ']' + data;

    this.cache.push(data);
  }

  log(level, data, opts) {
    if(!opts)
      opts = {};
    if(typeof level == 'string')
      level = this.findLevel(level);
    if(!level)
      level = this.levels[0]; // Use first level as fallback

    const color = level.color;
    const name  = level.name.toUpperCase();
    var   msg   = '[' + name + ']';

    if(opts.prefix)
      msg = '[' + opts.prefix + ']' + msg;
    if(opts.suffix)
      msg += '[' + suffix + ']';

    msg += ' > ';
    var raw = msg;

    if(color && colors[color])
      msg = colors[color](msg);
    if(opts.color && colors[opts.color])
      msg = colors[opts.color](msg);

    msg += data;
    raw += data;

    var log = true;

    if(level.log == false)
      log = false;
    if(opts.log == true)
      log = true;
    else if(opts.log == false) // Need it to be explicitly false, that's why I use else if instead of else
      log = false;

    var save = true;

    if(level.save == false)
      save = false;
    if(opts.save == true)
      save = true;
    else if(opts.save == false) // ^
      save = false;

    if(log)
      console.log(msg);

    if(save)
      this.save(raw);

    if(level.fatal || opts.fatal) {
      var alert = true;

      if(opts.alert == false)
        alert = false;

      if(alert)
        this.log('warning', 'Shutting down...');

      process.exit();
    }
  }

  createLevel(level) {
    const name = level.name.toLowerCase();
    var funcName = name;

    if(level.function)
      funcName = level.function;

    this.levels.push(level);
    this[funcName] = (...args) => {
      this.log(level, ...args);
    };
  }

  findLevel(name) {
    return this.levels.find(level => level.name == name.toLowerCase());
  }
}

module.exports = Logger;
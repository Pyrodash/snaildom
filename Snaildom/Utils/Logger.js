'use strict';

const fs     = require('fs');

const utils  = require('./Utils');
const colors = require('colors');

class Logger {
  constructor(savePath, levels, loop) {
    this.path = savePath;

    this.levels = [];
    this.cache = [];

    this.createLevels(levels);

    if(loop !== false)
      this.interval = setInterval(this.saveLoop.bind(this), 5 * 60 * 1000)
  }

  saveLoop() {
    return new Promise((resolve, reject) => {
      if(this.cache.length == 0) return;

      fs.appendFile(this.path, this.cache.join('\n') + '\n', 'utf8', err => {
        if(err) {
          console.warn('Failed to save logs. WTF!');
          console.error(err);

          reject(err);
        } else {
          this.cache = [];

          this.log(null, 'Saved logs successfully.', { save: false });
          resolve();
        }
      });
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
      level = this.findLevel('info') || { name: 'info', color: 'green' };

    const color = level.color;
    const name  = level.name.toUpperCase();
    var   msg   = level.key || '[' + name + ']';

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

    this[funcName] = (...args) => {
      this.log(level, ...args);
    };
    level.function = { f: this[funcName], name: funcName };
    this.levels.push(level);
  }

  createLevels(levels) {
    for(var level of levels) {
      this.createLevel(level);
    }
  }

  createSubLevel(level) {
    level.parent = level.parent.toLowerCase();
    const parent = this.levels.find(lev => lev.name.toLowerCase() == level.parent);

    if(!parent)
      return this.log('warning', 'Parent ' + level.parent + ' not found for sublevel ' + level.name + '.');

    if(!level.color)
      level.color = parent.color;

    level.key = '[' + parent.name.toUpperCase() + ']' + '[' + level.name.toUpperCase() + ']';
    level.sublevel = true;

    this.createLevel(level);
  }

  findLevel(name) {
    return this.levels.find(level => level.name == name.toLowerCase());
  }

  removeLevel(level) {
    const func = level.function;

    this[func.name] = null;
    delete this[func.name];

    for(var i in this.levels) {
      if(this.levels[i] == level) {
        this.levels.splice(i, 1);

        break;
      }
    }
  }

  removeLevels(removeSubs) {
    for(var level of this.levels) {
      if(!level.sublevel || removeSubs == true)
        this.removeLevel(level);
    }
  }
}

module.exports = Logger;
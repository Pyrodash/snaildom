'use strict';

const Manager = require('../Manager');
const path    = require('path');

class Handler extends Manager {
  constructor(world) {
    super({
      "name": "handler",
      "path": path.join(__dirname, '..', 'Handlers'),
      "params": world,
      "cli": {
        "cli": world.cli
      }
    }, world);

    this.packets = {};
  }

  find(packet) {
    var myHandlers = this.packets[packet] || [];
    var handlers = [];

    if(myHandlers.constructor !== Array)
      myHandlers = [myHandlers];

    for(var i in myHandlers) {
      const handler = myHandlers[i];

      if(handler.flags.override)
        return [handler.func];
      else
        handlers.push(handler.func);
    }

    for(var i in this.loader.storage) {
      const handler = this.loader.storage[i];
      const results = handler.packets[packet];

      if(results && results.length > 0)
        handlers = [...handlers, ...results];
    }

    return handlers;
  }

  register(name, func, flags) {
    if(!name || !func)
      return logger.warn('Not enough arguments. [' + Array.from(arguments).join(', ') + ']');
    if(!flags)
      flags = {};

    if(!this.packets[name])
      this.packets[name] = [];

    this.packets[name].push({
      func: func,
      flags: flags
    });
  }

  unregister(name, func) {
    if(typeof name == 'function') {
      func = name;
      name = null;
    }

    if(name && !func)
      this.packets[name] = [];
    else if(name && func) {
      if(!this.packets[name])
        return;

      for(var i in this.packets[name]) {
        const handler = this.packets[name][i];

        if(handler.func == func)  {
          this.packets[name].splice(i, 1);

          return;
        }
      }
    }
  }
}

module.exports = Handler;
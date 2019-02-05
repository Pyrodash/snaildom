'use strict';

const path         = require('path');
const utils        = require('../Snaildom/Utils/Utils');
const logger       = require('../Snaildom/Utils/Logger');

const EventManager = require('../Snaildom/Utils/EventManager');

class Plugin extends EventManager {
  constructor(name, myPath, manager) {
    super();

    if(name.constructor.name == 'PluginManager') {
      manager = name;
      name = null;
    }
    if(myPath.constructor.name == 'PluginManager') {
      manager = myPath;
      myPath = null;
    }

    if(!myPath)
      myPath = path.join(__dirname, name);

    this.name = name || 'plugin';
    this.path = myPath;

    this.world = manager.world;
    this.server = this.world.server;
    this.database = this.world.database;

    this.roomManager = this.world.roomManager;
    this.handlers = this.world.handlers;
    this.plugins = manager;

    this.config = utils.require(path.join(this.path, 'config.json'), {});

    this.dependentPlugins = {
      "commands": plugin => {
        if(!this.__external)
          this.__external = {};
        if(!this.__external.commands)
          this.__external.commands = {};

        for(var name in this.__external.commands) {
          const handlers = this.__external.commands[name];

          if(typeof handlers == 'function')
            plugin.registerCommand(name, handlers);
          else {
            for(var i in handlers) {
              var handler = handlers[i];

              if(typeof handler == 'function')
                handler = {func: handler, flags: {}};

              plugin.registerCommand(name, handler.func, handler.flags);
            }
          }
        }
      }
    };

    const p = this.plugins.find('logger') || this.__loggerPlaceholder();
    this.logger = p;

    this.depend('logger', this.__onLoggerReady.bind(this));
    this.__setup();
  }

  get(key) {
    return this.config[key];
  }

  __setup() {
    this.addEvent(this.plugins.loader, 'loaded plugin', (name, plugin) => {
      for(var i in this.dependentPlugins) {
        const handler = this.dependentPlugins[i];
        const dependency = i.toLowerCase();

        if(dependency == this.name.toLowerCase())
          continue;

        if(dependency == name.toLowerCase())
          handler(plugin);
      }
    });
  }

  register(type, name, func, flags) {
    type = type ? type.toLowerCase() : false;

    if(!flags)
      flags = {};
    if(!type)
      type = 'handler';
    if(!func && type && name) {
      if(['handler', 'command'].includes(type))
        return logger.warn('No function provided for ' + type + ' of name ' + name + '.');
      else {
        name = type;
        func = name;
        type = 'handler';
      }
    }
    if(!type || !name || !func)
      return logger.warn('Not enough arguments. [' + Array.from(arguments).join(', ') + ']');

    if(typeof func == 'string') {
      if(this[func] && typeof this[func] == 'function')
        func = this[func].bind(this);
    }

    switch(type) {
      case 'handler':
        type = 'handlers';
      break;
      case 'command':
        type = 'commands';
    }

    if(!this.__external)
      this.__external = {};
    if(!this.__external[type])
      this.__external[type] = {};
    if(!this.__external[type][name])
      this.__external[type][name] = [];

    if(typeof func == 'function') {
      this.__external[type][name].push({
        func: func,
        flags: flags
      });

      var manager;

      switch(type) {
        case 'handlers':
          this.handlers.register(name, func, flags);
        break;
        case 'commands':
          const commands = this.plugins.find('commands');

          if(commands)
            commands.registerCommand(name, func, flags);
      }
    }
  }

  override(type, name, func) {
    type = type ? type.toLowerCase() : false;

    if(!type)
      type = 'handler';
    if(!func && type && name) {
      if(['handler', 'command'].includes(type))
        return logger.warn('No function provided for ' + type + ' of name ' + name + '.');
      else {
        name = type;
        func = name;
        type = 'handler';
      }
    }
    if(!type || !name || !func)
      return logger.warn('Not enough arguments. [' + Array.from(arguments).join(', ') + ']');

    if(typeof func == 'string') {
      if(this[func] && typeof this[func] == 'function')
        func = this[func].bind(this);
    }

    if(typeof func != 'function')
      return logger.warn('Invalid function ' + func + '.');

    switch(type) {
      case 'command':
        this.register('command', name, func, {override: true});
      break;
      case 'handler':
        this.register('handler', name, func, {override: true});
    }
  }

  depend(name, handler) {
    this.dependentPlugins[name] = handler.bind(this);
  }

  __loggerPlaceholder() {
    return {
      write: (msg) => {
        if(!this.__logCache)
          this.__logCache = [];
        if(!msg.time)
          msg.time = new Date();

        const args = [msg, ...Array.from(arguments).slice(1)];

        this.__logCache.push({
          func: 'write',
          args: args
        });
      },
      log: () => {
        this.__logCache.push({
          func: 'log',
          args: Array.from(arguments)
        });
      }
    }
  }

  __onLoggerReady(plugin) {
    this.logger = plugin;

    if(this.__logCache) {
      for(var i in this.__logCache) {
        const item = this.__logCache[i];
        const {func, args} = item;
        
        this.logger[func](...args);
      }
    }
  }

  destroy() {
    this.removeEvents();

    for(var type in this.__external) {
      const content = this.__external[type];
      var container;

      switch(type) {
        case 'handler':
        case 'handlers':
          container = this.handlers;
        break;
        case 'command':
        case 'commands':
          container = this.plugins.find('commands');
      }

      for(var name in content) {
        var funcs = content[name];

        if(funcs.constructor !== Array)
          funcs = [funcs];

        for(var i in funcs) {
          var func = funcs[i];

          if(typeof func == 'object')
            func = func.func;

          if(container)
            container.unregister(name, func);
        }
      }
    }
  }
}

module.exports = Plugin;
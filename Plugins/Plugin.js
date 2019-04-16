'use strict';

const path         = require('path');
const utils        = require('../Snaildom/Utils/Utils');

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
    this.dependencies = {};

    this.logger = this.world.logger;
    this.loggerPro = this.__loggerPlaceholder();

    this.__setupDependencies();
    this.__setup();
  }

  get(key) {
    return this.config[key];
  }

  __setupDependencies() {
    this.depend('plugin', 'commands', false, this.__onCommandsReady.bind(this));
    this.depend('plugin', 'logger', 'loggerPro', this.__onLoggerReady.bind(this));
  }

  __setup() {
    this.addEvent(this.plugins.loader, 'loaded plugin', (name, plugin) => {
      const dependencies = this.dependencies['plugin'];

      for(var i in dependencies) {
        const dependency = dependencies[i];
        const {handler} = dependency;

        if(dependency.name == this.name.toLowerCase())
          continue;

        if(dependency.name == name.toLowerCase())
          handler(plugin, name.toLowerCase());
      }
    });

    this.addEvent(this.handlers.loader, 'loaded handler', (name, handler) => {
      const dependencies = this.dependencies['plugin'];

      for(var i in dependencies) {
        const dependency = dependencies[i];
        const depHandler = dependency.handler;

        if(dependency.name == this.name.toLowerCase())
          continue;

        if(dependency.name == name.toLowerCase())
          depHandler(handler, name.toLowerCase());
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
        return this.logger.warn('No function provided for ' + type + ' of name ' + name + '.');
      else {
        name = type;
        func = name;
        type = 'handler';
      }
    }
    if(!type || !name || !func)
      return this.logger.warn('Not enough arguments. [' + Array.from(arguments).join(', ') + ']');

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
        return this.logger.warn('No function provided for ' + type + ' of name ' + name + '.');
      else {
        name = type;
        func = name;
        type = 'handler';
      }
    }
    if(!type || !name || !func)
      return this.logger.warn('Not enough arguments. [' + Array.from(arguments).join(', ') + ']');

    if(typeof func == 'string') {
      if(this[func] && typeof this[func] == 'function')
        func = this[func].bind(this);
    }

    if(typeof func != 'function')
      return this.logger.warn('Invalid function ' + func + '.');

    switch(type) {
      case 'command':
        this.register('command', name, func, {override: true});
      break;
      case 'handler':
        this.register('handler', name, func, {override: true});
    }
  }

  depend(...args) {
    const types = ['plugin', 'handler'];
    const defaultType = 'plugin';
    const defaultHandler = this.__onDependencyLoaded.bind(this);

    var type, name, key, handler;

    const getHandler = k => {
      if(typeof k == 'function') return k;

      k = k.split('h.'); // e.g. h.onCommandsLoaded
      if(k.length == 1) return false;
      k = k[1];

      if(this[k] && typeof this[k] == 'function') return this[k].bind(this);

      return false;
    };
    const isHandler = k => Boolean(getHandler(k));

    function parseArgs(i) {
      switch(i) {
        case 1:
          name = args[0];
        break;
        case 2:
          if(types.includes(args[0])) {
            type = args[0];
            name = args[1];
          } else {
            name = args[0];

            if(isHandler(args[1]))
              handler = getHandler(args[1]);
            else
              key = args[1];
          }
        break;
        case 3:
          if(types.includes(args[0])) {
            type = args.shift();
            name = args.shift();
          } else
            name = args.shift();

          if(!key) {
            if(isHandler(args[0]))
              handler = getHandler(args[0]);
            else
              key = args[0];
          }
        break;
        case 4:
          type = args[0];
          name = args[1];
          key = args[2];
          handler = getHandler(args[3]);
      }

      if(!type) type = defaultType;
      if(key === undefined) key = name;
      if(!handler) handler = defaultHandler;
    }

    parseArgs(args.length);

    if(!type || !name || !handler)
      return this.logger.warn('Not enough arguments to add a new dependency.');

    const realHandler = handler;
    handler = (...args2) => {
      realHandler(...args2, type);
      defaultHandler(...args2, type);
    };
    name = name.toLowerCase();

    if(!this.dependencies[type]) this.dependencies[type] = [];
    this.dependencies[type].push({name, type, key, handler});

    switch(type) {
      case 'plugin':
        const plugin = this.plugins.find(name);

        if(plugin)
          handler(plugin, name);
      break;
      case 'handler':
        const myHandler = this.handlers.find(name, true);

        if(myHandler)
          handler(myHandler, name);
    }
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

  __onCommandsReady(plugin) {
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

  __onLoggerReady(plugin) {
    if(this.__logCache) {
      for(var i in this.__logCache) {
        const item = this.__logCache[i];
        const {func, args} = item;

        this.loggerPro[func](...args);
      }
    }
  }

  __onDependencyLoaded(dep, name, type) {
    const d = this.dependencies[type].find(dp => dp.name == name);

    if(d && d.key)
      this[d.key] = dep;
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
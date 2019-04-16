'use strict';

const EventManager = require('./Utils/EventManager');

class Handler extends EventManager {
  constructor(world) {
    super();

    this.world = world;

    this.logger = world.logger;
    this.server = world.server;

    this.database = world.database;
    this.roomManager = world.roomManager;

    this.packets = {};
  }

  register(action, handler) {
    if(!this.packets[action])
      this.packets[action] = [];

    if(this.packets[action].constructor !== Array)
      this.packets[action] = [this.packets[action]];

    if(!handler)
      return;

    if(typeof handler == 'string') {
      if(this[handler] && typeof this[handler] == 'function')
        handler = this[handler].bind(this);
      else
        return this.logger.warn('Function ' + handler + ' was not found for a handler.');
    }

    if(typeof handler == 'function') {
      this.packets[action].push(handler);
    }
  }
}

module.exports = Handler;
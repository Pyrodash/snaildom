'use strict';

const FileLoader = require('./Utils/FileLoader');

class Manager {
  constructor(opts, world) {
    if(opts && opts.constructor.name === 'World') {
      world = opts;
      opts = null;
    }

    if(world) {
      this.world = world;

      this.logger = world.logger;
      this.server = world.server;

      this.database = world.database;
      this.crumbs = world.crumbs;
    }

    if(opts)
      this.createLoader(opts);

    this.__registerEvents();
  }

  __registerEvents() {
    if(!this.world || !this.world.on)
      return;

    this.world.on('database reloaded', db => {
      this.database = db;
    });
  }

  createLoader(opts) {
    if(!opts['logger'])
      opts['logger'] = this.logger;

    this.loader = new FileLoader(opts);
  }
}

module.exports = Manager;
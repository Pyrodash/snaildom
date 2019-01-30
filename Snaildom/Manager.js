'use strict';

const FileLoader = require('./Utils/FileLoader');

class Manager {
  constructor(opts, world) {
    if(opts.constructor.name === 'World') {
      world = opts;
      opts = null;
    }

    this.world = world;
    this.server = world.server;

    this.database = world.database;

    if(opts)
      this.createLoader(opts);

    this.__registerEvents();
  }

  __registerEvents() {
    this.world.on('database reloaded', db => {
      this.database = db;
    });
  }

  createLoader(opts) {
    this.loader = new FileLoader(opts);
  }
}

module.exports = Manager;
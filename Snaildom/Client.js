'use strict';

const logger       = require('./Utils/Logger');
const utils        = require('./Utils/Utils');

const EventManager = require('./Utils/EventManager');

class Client extends EventManager {
  constructor(socket, server, dummy) {
    super();

    this.socket = socket;
    this.server = server;
    this.dummy  = dummy || false;

    if(this.socket)
      this.ip = this.socket.remoteAddress;

    this.world = server.world;
    this.database = this.world.database;

    this.roomManager = this.world.roomManager;

    this.dependencies = [];
    this.__registerEvents();

    if(this.world.dependencyManager) {
      const deps = this.world.dependencyManager.loader.storage;

      this.applyDeps(deps);
    }

    if(this.construct && typeof this.construct == 'function')
      this.construct();
  }

  applyDeps(deps) {
    this.removeDeps();

    for(var i in deps) {
      deps[i].apply(this);

      this.dependencies.push(deps[i]);
    }
  }

  removeDeps() {
    for(var i in this.dependencies) {
      this.dependencies[i].remove(this);
    }

    this.dependencies = [];
  }

  __registerEvents() {
    if(this.dummy)
      return;

    if(this.socket) {
      this.socket.on('data', data => {
        const packets = data.toString('utf8').split('\0');

        for(var i in packets) {
          const packet = packets[i];

          if(packet && !utils.isEmpty(packet))
            this.world.process(packet, this);
        }
      });

      this.socket.on('error', err => {
        logger.error(err);

        this.disconnect();
      });

      this.socket.on('close', _ => {
        logger.write('A client has disconnected.');

        this.disconnect();
      });
    }

    this.addEvent(this.world, 'database reloaded', db => {
      this.database = db;
    })
  }

  destroy() {
    this.removeEvents();
  }
}

module.exports = Client;
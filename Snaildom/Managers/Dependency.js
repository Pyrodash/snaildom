'use strict';

const Manager = require('../Manager');
const path    = require('path');

class Dependency extends Manager {
  constructor(world) {
    super({
      "name": "dependency",
      "path": path.join(__dirname, '..', 'Dependencies'),
      "cli": {
        "cli": world.cli
      }
    }, world);

    this.loader.on('loaded dependency', this.refreshDeps.bind(this));
    this.loader.on('loaded dependencies', this.refreshDeps.bind(this));
  }

  refreshDeps() {
    for(var i in this.server.clients) {
      const client = this.server.clients[i];
      
      client.applyDeps(this.loader.storage);
    }
  }
}

module.exports = Dependency;
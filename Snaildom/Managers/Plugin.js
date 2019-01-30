'use strict';

const Manager = require('../Manager');
const path    = require('path');

class Plugin extends Manager {
  constructor(world) {
    super(world);

    this.createLoader({
      "name": "plugin",
      "path": path.join(__dirname, '..', '..', 'Plugins'),
      "recursive": true,
      "mainFile": "main",
      "params": this,
      "cli": {
        "cli": world.cli
      }
    });
  }

  find(name) {
    name = name.toLowerCase();

    return this.loader.storage.find(plugin => plugin.name == name || plugin._metadata.name == name);
  }
}

module.exports = Plugin;
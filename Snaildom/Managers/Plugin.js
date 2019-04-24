'use strict';

const Manager = require('../Manager');
const path    = require('path');

class Plugin extends Manager {
  constructor(world, autoLoad) {
    super(world);

    if(autoLoad === undefined)
      autoLoad = true;

    this.createLoader({
      "name": "plugin",
      "path": path.join(__dirname, '..', '..', 'Plugins'),
      "recursive": true,
      "mainFile": "main",
      "params": this,
      "cli": {
        "cli": world ? world.cli : null
      },
      autoLoad
    });
  }

  find(name) {
    name = name.toLowerCase();

    return this.loader.storage.find(plugin => plugin.name == name || plugin._metadata.name == name);
  }
}

module.exports = Plugin;
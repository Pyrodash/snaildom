'use strict';

const reload = require('require-reload')(require);

class Crumbs {
  constructor(logger) {
    this.logger = logger;
    this.loaded = false;

    this.reload();
  }

  reload() {
    this.items     = reload('./Crumbs/Items');
    this.furniture = reload('./Crumbs/Furniture');
    this.factions  = reload('./Crumbs/Factions');
    this.books     = reload('./Crumbs/Books');

    if(!this.loaded) {
      this.loaded = true;

      this.logger.write('Loaded crumbs.');
    } else
      this.logger.write('Reloaded crumbs.');
  }

  build() {
    return {
      items: this.items,
      furniture: this.furniture,
      factions: this.factions
    };
  }
}

module.exports = Crumbs;
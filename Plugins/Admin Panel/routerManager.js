'use strict';

const path       = require('path');
const FileLoader = require('../../Snaildom/Utils/FileLoader');

class RouterManager {
  constructor(panel) {
    this.panel = panel;
    this.loader = new FileLoader({
      name: 'router',
      path: path.join(__dirname, 'Routers'),
      params: panel,
      ignored: ['router']
    });
  }
}

module.exports = RouterManager;
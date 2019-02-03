'use strict';

const os     = require('os');
const Router = require('./Router');

class Main extends Router {
  constructor(panel) {
    super(panel);

    this.register('GET', '/', 'process', 'sessionOnly');
    this.register('GET', '/users', 'viewUsers', 'sessionOnly');
    this.register('GET', '/bans', 'viewBans', 'sessionOnly');
    this.register('GET', '/logs', 'viewLogs', 'sessionOnly');
  }

  process(req, res) {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    res.render(this.view('overview'), {
      memory: {
        total: formatSize(total),
        used: formatSize(used),
        free: formatSize(free)
      }
    });
  }

  viewUsers(req, res) {
    res.render(this.view('users'));
  }
}

function formatSize(size) {
  var i = Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

module.exports = Main;
'use strict';

const logger     = require('../Utils/Logger');

const Dependency = require('../Dependency');
const Shell      = require('../Shell');

class MyShell extends Dependency {
  createShell() {
    return new Promise((resolve, reject) => {
      this.database.getShell('Owner', this.id).then(shell => {
        if(shell) {
          shell = {
            id: shell.ID,
            owner: this,
            furniture: shell.Furniture,
            type: shell.Type
          };
          shell = new Shell(shell, this.world);
          this.myShell = shell;

          resolve(shell);
        } else
          this.database.createShell({
            Owner: this.id
          })
          .then(res => this.createShell())
          .catch(logger.error);
      }).catch(logger.error);
    });
  }
}

module.exports = MyShell;
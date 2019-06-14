'use strict';

const Dependency  = require('../Dependency');
const Shell       = require('../Shell');

const defaultType = 'yellow';

class MyShell extends Dependency {
  createShell(shellObj) {
    return new Promise((resolve, reject) => {
      if(!shellObj) {
        this.database.getShell('Owner', this.id).then(shell => {
          if(shell)
              this.createShell(shell).then(resolve).catch(reject);
          else
            this.database.createShell({
              Owner: this.id,
              Type: defaultType,
              Furniture: ''
            })
            .then(res => {
              this.createShell({ ID: res[0], Type: defaultType }).then(resolve).catch(reject);
            })
            .catch(this.logger.error);
        }).catch(this.logger.error);
      } else {
        var shell = {
          id: shellObj.ID,
          owner: this,
          furniture: shellObj.Furniture || '',
          type: shellObj.Type
        };
        shell = new Shell(shell, this.world);
        this.myShell = shell;

        resolve(shell);
      }
    });
  }
}

module.exports = MyShell;
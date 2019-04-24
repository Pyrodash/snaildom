'use strict';

const cp     = require('child_process');
const os     = require('os');

const path   = require('path');
const npmCmd = os.platform() == 'win32' ? 'npm.cmd' : 'npm';

class Installer {
  constructor(p) {
    this.setPath(p);
  }

  setPath(p) {
    this.path = p;
  }

  install(...args) {
    return new Promise((resolve, reject) => {
      args.unshift('i');

      const proc = cp.spawn(npmCmd, args, { env: process.env, cwd: this.path, stdio: 'inherit' });
      proc.on('close', resolve);
    });
  }

  installPackage(pkg) {
    return new Promise((resolve, reject) => {
      const dependencies = [];
      const args = [];

      if(!pkg.dependencies) pkg.dependencies = {};
      if(!pkg.devDependencies) pkg.devDependencies = {};

      for(var dependency in pkg.dependencies) {
        const version = pkg.dependencies[dependency];

        dependencies.push({ name: dependency, version });
      }

      for(var dependency in pkg.devDependencies) {
        const version = pkg.devDependencies[dependency];

        dependencies.push({ name: dependency, version, dev: true });
      }

      for(var i in dependencies) {
        const dependency = dependencies[i];

        if(!dependency.version) dependency.version = 'latest';

        try {
          const dep = require(dependency.name);

          // TODO: check versions
        } catch(err) {
          const {code} = err;

          if(code == 'MODULE_NOT_FOUND')
            args.push([dependency.name + '@' + dependency.version]);
          else
            console.error(err);
        }
      }

      Promise.all(
        args.map(arg => this.install(...arg))
      ).then(resolve).catch(reject);
    });
  }
}

module.exports = Installer;
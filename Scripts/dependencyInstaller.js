'use strict';

const path = require('path');

class DependencyInstaller {
  constructor(installer) {
    this.installer = installer;
  }

  install() {
    return new Promise((resolve, reject) => {
      const utils         = require('../Snaildom/Utils/Utils');

      const PluginManager = require('../Snaildom/Managers/Plugin');
      const pluginManager = new PluginManager(null, false);

      pluginManager.loader.listFiles().then(async files => {
        for(var i in files) {
          const file = files[i];
          const filePath = path.join(pluginManager.loader.path, file);

          const pkgPath = path.join(filePath, 'package.json');
          const pkg = utils.require(pkgPath);

          if(pkg) {
            if(pkg.disabled)
              continue;

            this.installer.setPath(filePath);
            //await this.installer.installPackage(pkg);
            await this.installer.install();
          }
        }

        resolve();
      });
    });
  }
}

module.exports = DependencyInstaller;
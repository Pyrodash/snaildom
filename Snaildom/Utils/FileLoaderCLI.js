'use strict';

const utils  = {
  upperFirst: function(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }
};
const path   = require('path');

class FileLoaderCLI {
  constructor(cli, loader, suffix) {
    this.suffix = suffix || '';

    this.cli = cli;
    this.loader = loader;
    this.logger = loader.logger;

    this.commands = {
      "load": this.suffix ? "load" + suffix : "load " + this.loader.name,
      "reload": this.suffix ? "reload" + suffix : "reload " + this.loader.name,
      "refresh": this.suffix ? "refresh" + suffix : "refresh " + this.loader.name
    };

    this.setup();
  }

  setup() {
    const suffix = this.suffix;

    this.cli.register(this.commands.load, name => {
      const upperName = utils.upperFirst(this.loader.name);

      if(!path.extname(name))
        name += '.js';

      if(!this.loader.find(name)) {
        this.loader
          .search(name)
          .then(filePath => {
            if(filePath) {
              const res = this.loader.load(filePath);

              if(!res)
                this.logger.warn(upperName + ' is invalid or not a class.');
            } else
              this.logger.warn(upperName + ' doesn\'t exist.');
          })
          .catch(this.logger.error);
      } else
        this.logger.warn(upperName + ' already loaded.');
    }, true)
    this.cli.register(this.commands.reload, this.loader.reload.bind(this.loader), true);
    this.cli.register(this.commands.refresh, this.loader.loadFiles.bind(this.loader), true);
  }
}

module.exports = FileLoaderCLI;

'use strict';

const CLI          = require('./FileLoaderCLI');

const logger       = require('./Logger');
const reload       = require('require-reload');

const path         = require('path');
const fs           = require('fs');

const EventEmitter = require('events');
const utils = {
  isClass: function(v) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
  },
  upperFirst: function(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }
};

class FileLoader extends EventEmitter {
  constructor(opts) {
    super();

    this.name = opts.name || 'file';
    this.pluralName = this.name.charAt(this.name.length - 1) == 'y' ? this.name.slice(0, -1) + 'ies' : this.name + 's';

    this.path = opts.path;
    this.recursive = opts.recursive || false;

    this.params = opts.params || {};
    this.ignored = opts.ignored || [];

    this.files = [];
    this.storage = opts.storage || this.files;

    this.logging = opts.logging || true;
    this.autoLoad = opts.autoLoad || true;

    this.mainFile = opts.mainFile;

    const cli = opts.cli || {};

    if(cli && cli.cli) {
      this.cli = new CLI(cli.cli, this, cli.suffix);
    }


    if(this.autoLoad)
      this.loadFiles();
  }

  loadFiles(loggingType) {
    fs.readdir(this.path, (err, files) => {
      if(err) {
        logger.error(err);

        logger.warn('Failed to load ' + this.pluralName + '.');
      } else {
        files = files.filter(file => this.recursive ? !path.extname(file) : path.extname(file) == '.js');
        files = files.filter(file => !this.ignored.includes(path.basename(file, path.extname(file)).toLowerCase()));

        if(files.length > 0) {
          for(var i in files) {
            const file = files[i];
            var   filePath = path.join(this.path, file);

            const mainFile = this.mainFile || path.basename(filePath);

            if(this.recursive)
              filePath = path.join(filePath, mainFile + '.js');

            if(loggingType)
              this.load(filePath, '');
            else
              this.load(filePath);
          }
        }

        this.emit('loaded ' + this.pluralName);

        if(loggingType == 'numeral')
          logger.write('Loaded ' + this.storage.length + ' ' + this.pluralName + '.');
      }
    });
  }

  find(name) {
    name = name.toLowerCase();

    return this.storage.constructor === Array ? this.storage.find(file => file._metadata.key == name) : this.storage[name];
  }

  load(filePath, customLog) {
    var name;

    if(!this.mainFile)
      name = path.basename(filePath, path.extname(filePath));
    else {
      name = filePath.split(path.sep);
      name = name[name.length-2];
    }

    const key  = name.toLowerCase();

    if(path.extname(filePath) == '.js') {
      try {
        var file = reload(filePath);
      }
      catch(err) {
        if(err.code == 'MODULE_NOT_FOUND' && err.message.indexOf(filePath) > -1)
          return false;
        else {
          console.log(err.stack);

          logger.warn('Failed to load ' + this.name + ' ' + name);
        }
      }

      if(file && utils.isClass(file)) {
        if(this.find(name))
          this.unload(name);

        const params = this.params;

        if(params.constructor === Array)
          file = new (file.bind.apply(file, [file, ...params])); // Create a class instance with the parameters
        else
          file = new file(params);

        file._metadata = {
          "name": name,
          "key": key,
          "path": filePath
        };

        if(this.storage.constructor === Array)
          this.storage.push(file);
        else
          this.storage[key] = file;

        const log = customLog !== undefined ? customLog : 'Loaded ' + this.name + ' ' + name + '.';

        if(this.logging && log)
          logger.write(log);

        this.emit('loaded ' + this.name, name, file);

        return true;
      }
    }

    return false;
  }

  unload(name) {
    for(var i in this.storage) {
      const file = this.storage[i];

      if(file._metadata.name == name) {
        if(file.destroy && typeof file.destroy == 'function')
          file.destroy();

        if(this.storage.constructor === Array)
          this.storage.splice(i, 1);
        else {
          this.storage[i] = null;
          delete this.storage[i];
        }

        break;
      }
    }
  }

  reload(name) {
    if(name) {
      const file = this.find(name);

      if(file && file._metadata)
        this.load(file._metadata.path, 'Reloaded ' + this.name + ' ' + file._metadata.name + '.');
      else
        logger.warn('Couldn\'t find ' + this.name + ' ' + name + '.');
    }
  }

  search(name) {
    return new Promise((resolve, reject) => {
      fs.readdir(this.path, (err, files) => {
        if(err)
          reject(err);
        else {
          if(this.recursive)
            name = path.basename(name, path.extname(name));

          var fileName = files.find(file => file.toLowerCase() == name) || '';
          var filePath = fileName ? path.join(this.path, fileName) : false;

          if(!this.recursive)
            return resolve(filePath);
          if(!filePath)
            return resolve(false);

          filePath = path.join(filePath, fileName + '.js');

          fs.stat(filePath, (err, stats) => {
            if(err) {
              if(err.code == 'ENOENT')
                resolve(false);
              else
                reject(err);
            } else
              resolve(filePath);
          });
        }
      });
    });
  }
}

module.exports = FileLoader;
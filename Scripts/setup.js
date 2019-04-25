'use strict';

const cp        = require('child_process');
const os        = require('os');

const path      = require('path');

// Running scripts in npm is retarded so we have to use absolute paths.
const config    = require(path.join(__dirname, '..', '/config.json'));
const Installer = require(path.join(__dirname, 'installer'));

const npmCmd    = os.platform() == 'win32' ? 'npm.cmd' : 'npm';
const dbConfig  = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
};

var colors;

function spawn(...args) {
  return new Promise((resolve, reject) => {
    cp.spawn(npmCmd, args, { env: process.env, cwd: path.join(__dirname, '..'), stdio: 'inherit' })
      .on('close', resolve);
  });
}

class Setup {
  constructor() {
    this.installer = new Installer(__dirname);

    this.install();
  }

  log(message) {
    console.log(colors.green(message));
  }

  error(err) {
    if(err.stack)
      err = err.stack;

    console.log(colors.red(err));
  }

  async install() {
    await this.installer.install('mysql-import');
    await spawn('run', 'install_deps');

    this.onDepsInstalled();
  }

  onDepsInstalled() {
    colors = require('colors');

    this.setupDB().then(this.complete.bind(this)).catch(this.error);
  }

  setupDB() {
    return new Promise((resolve, reject) => {
      const myDB = Object.assign({}, dbConfig);
      delete myDB.database;

      const conn = require('mysql').createConnection(myDB);

      conn.connect();
      conn.query('CREATE DATABASE IF NOT EXISTS ' + dbConfig['database'], (err => {
        conn.end();

        if(err) {
          this.error(err);
          console.log('\n');
          this.error('Failed to setup database.');
        } else
          this.importDB().then(resolve);
      }));
    });
  }

  importDB() {
    return new Promise((resolve, reject) => {
      require('mysql-import').config({
        ...dbConfig,
        onerror: reject
      }).import(path.join(__dirname, '..', 'db.sql')).then(resolve);
    });
  }

  complete() {
    this.log('Database was setup successfully.');
    this.log(colors.bold('Snaildom is ready.'));

    const firstServer = Object.keys(config.servers)[0];

    console.log('Run the server using the following command: ' + colors.bold('node run.js ' + firstServer));
  }
}

new Setup;
'use strict';

const path         = require('path');
const config       = require(path.join(__dirname, '..', 'config.json'));
const Logger       = require(path.join(__dirname, '..', 'Snaildom', 'Utils', 'Logger'));

const Installer    = require(path.join(__dirname, 'installer'));
const DepInstaller = require(path.join(__dirname, 'dependencyInstaller'))

const logger    = new Logger(null, config.logging.levels, false);
const installer = new Installer(path.join(__dirname, '..'));

async function install() {
  await installer.install();

  const depInstaller = new DepInstaller(installer, logger);
  await depInstaller.install();


  const colors = require('colors');

  console.log(colors.green('Installed dependencies successfully.'));
}

install();
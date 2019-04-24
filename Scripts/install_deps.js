'use strict';

const path         = require('path');

const Installer    = require('./installer');
const DepInstaller = require('./dependencyInstaller')

const installer = new Installer(path.join(__dirname, '..'));

async function install() {
  await installer.install();
  const depInstaller = new DepInstaller(installer);
  await depInstaller.install();


  const colors = require('colors');

  console.log(colors.green('Installed dependencies successfully.'));
}

install();
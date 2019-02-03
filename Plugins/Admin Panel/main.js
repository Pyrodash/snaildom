'use strict';

const path          = require('path');
const Plugin        = require('../Plugin');

const express       = require('express');
const helmet        = require('helmet');
const logger        = require('../../Snaildom/Utils/Logger');

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const cookieSession = require('cookie-session');

const RouterManager = require('./routerManager');

class AdminPanel extends Plugin {
  constructor(manager) {
    super('admin panel', __dirname, manager);

    this.port = this.get('port') || 8080;

    this.views = {};
    this.views.root = path.join(__dirname, 'Views');
    this.views.static = path.join(this.views.root, 'Static');

    this.start();
  }

  start() {
    this.app = express();

    this.app.use(helmet());
    this.app.use(cookieParser());

    this.app.use(bodyParser.urlencoded({extended: false}));
    this.app.use(cookieSession({
      "name": "snaildom-panel",
      "keys": ["Vrp85u8x/AF?(G+K"],
      "maxAge": 6 * 60 * 60 * 1000 // 6 hours (in milliseconds)
    }));

    this.app.use(express.static(this.views.static));
    this.app.set('view engine', 'ejs');

    this.routerManager = new RouterManager(this);
    this.server = this.app.listen(this.port);

    logger.write('Admin Panel listening on port ' + this.port + '.');
  }

  destroy() {
    this.server.close();
  }
}

module.exports = AdminPanel;
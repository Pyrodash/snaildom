'use strict';

const express = require('express');
const logger  = require('../../../Snaildom/Utils/Logger');

const path    = require('path');

class Router {
  constructor(route, panel) {
    if(typeof route == 'object') {
      panel = route;
      route = null;
    }

    this.route = route;
    this.router = express.Router();

    this.panel = panel;
    this.app = panel.app;

    this.database = panel.database;
    this.knex = this.database.knex;

    this.views = this.panel.views;
    this.middleware = this.middleware();

    this.apply();
  }

  apply() {
    if(this.route)
      this.app.use(this.route, this.router);
    else
      this.app.use(this.router);
  }

  register(method, route, processor, middleware) {
    if(!method || !route || !processor)
      return;

    if(typeof middleware == 'string') {
      if(this.middleware[middleware] && typeof this.middleware[middleware] == 'function')
        middleware = this.middleware[middleware];
    }

    const methods = ['get', 'post', 'head', 'put', 'delete', 'connect', 'options', 'trace'];
    method = method.toLowerCase();

    if(!methods.includes(method))
      return logger.warn('Invalid method: ' + method + ' for route ' + route);

    if(typeof processor == 'string')
      processor = this[processor];

    if(typeof processor == 'function') {
      processor = processor.bind(this);
      const func = (req, res, next) => {
        try {
          processor(req, res, next);
        } catch(e) {
          logger.error(e);
        }
      };

      if(!middleware)
        this.router[method](route, func);
      else
        this.router[method](route, middleware, func);
    }
  }

  middleware() {
    return {
      noSessionOnly: (req, res, next) => {
        const {session} = req;

        if(session.id)
          res.redirect('/');
        else
          next();
      },
      sessionOnly: (req, res, next) => {
        const {session} = req;

        if(session.id) {
          this.database.getPlayer(session.id).then(user => {
            if(user && user.Rank > 2) {
              res.locals.Self = user;

              next();
            } else {
              this.destroySession(req);
              res.redirect('/login');
            }
          });
        } else
          res.redirect('/login');
      }
    };
  }

  view(name) {
    if(!path.extname(name))
      name += '.ejs';

    return path.join(this.views.root, name);
  }

  use(route, handler) {
    if(!handler) {
      handler = route;
      route = null;
    }

    if(typeof handler == 'string') {
      if(this.middleware[handler] && typeof this.middleware[handler] == 'function')
        handler = this.middleware[handler].bind(this);
    }

    if(route)
      this.router.use(route, handler);
    else
      this.router.use(handler);
  }

  destroySession(req) {
    req.session = null;
  }
}

module.exports = Router;
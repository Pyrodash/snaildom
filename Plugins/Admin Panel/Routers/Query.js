'use strict';

const logger = require('../../../Snaildom/Utils/Logger');
const Router = require('./Router');

class Query extends Router {
  constructor(panel) {
    super('/query', panel);

    this.use('sessionOnly');

    this.register('POST', '/user-list', 'handleUserList');
    this.register('POST', '/user', 'handleUser');
  }

  handleUserList(req, res) {
    var limit = Number(req.body.limit),
        offset = Number(req.body.offset),
        order = req.body.order;

    if(!limit || isNaN(limit))
      limit = 50;
    if(!offset || isNaN(limit))
      offset = 0;
    if(!order || !['asc', 'desc'].includes(order.toLowerCase()))
      order = 'desc';

    this.knex('users').select('ID', 'Username').limit(limit).offset(offset).orderBy('ID', order).then(users => {
      res.json(users);
    }).catch(err => this.error(err, req, res));
  }

  handleUser(req, res) {
    const {user} = req.body;

    if(!user)
      return res.end();

    const type = isNaN(user) ? 'Username' : 'ID';

    this.knex('users').select('ID', 'Username').where(type, user).then(user => {
      res.json(user);
    }).catch(err => this.error(err, req, res));
  }

  error(err, req, res) {
    logger.error(err);

    res.status(500);
    res.end();
  }
}

module.exports = Query;
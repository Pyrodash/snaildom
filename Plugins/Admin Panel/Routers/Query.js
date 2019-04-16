'use strict';

const utils  = require('../../../Snaildom/Utils/Utils');

const Router = require('./Router');

class Query extends Router {
  constructor(panel) {
    super('/query', panel);

    this.use('sessionOnly');

    this.register('POST', '/user-list', 'handleUserList');
    this.register('POST', '/ban-list', 'handleBanList');
    this.register('POST', '/log-list', 'handleLogList');
  }

  handleUserList(req, res) {
    this.fetchList('user', req, res);
  }

  handleBanList(req, res) {
    this.fetchList('ban', req, res);
  }

  handleLogList(req, res) {
    this.fetchList('log', req, res);
  }

  fetchList(type, req, res) {
    var limit = Number(req.body.limit),
        offset = Number(req.body.offset),
        order = req.body.order,
        where = utils.parse(req.body.where, {});

    if(!limit || isNaN(limit))
      limit = 50;
    if(!offset || isNaN(limit))
      offset = 0;
    if(!order || !['asc', 'desc'].includes(order.toLowerCase()))
      order = 'desc';

    var table;
    var select = [];
    var query = () => {
      return this.knex(table).select(...select);
    };
    var orderBy = 'ID';

    switch(type) {
      case 'user':
        table = 'users';
        select = ['ID', 'Username'];
      break;
      case 'ban':
        table = 'bans as B';
        select = ['B.ID', 'U.Username as User', 'I.Username as Issuer', 'B.Reason', 'B.Length', 'B.Date'];
        orderBy = 'B.ID';

        query = query()
          .join('users as U', 'B.User', '=', 'U.ID')
          .join('users as I', 'B.Issuer', '=', 'I.ID')
          .where('Active', 1);
      break;
      case 'log':
        table = 'logs';
        select = ['Action', 'Information', 'Date'];
    }

    if(typeof query == 'function')
      query = query();

    if(where && typeof where == 'object') {
      if(where.constructor === Array) {
        if(where.length > 0) {
          var func = 'where';

          for(var i in where) {
            var w = where[i];

            if(w.constructor !== Array)
              w = [w];

            query = query[func](...w);
            func = 'orWhere';
          }
        }
      } else if(Object.keys(where).length > 0) {
        if(where.constructor !== Array)
          where = [where];

        query = query.where(...where);
      }
    }

    query.limit(limit).offset(offset).orderBy(orderBy, order).then(items => {
      res.json(items);
    }).catch(err => this.error(err, req, res));
  }

  error(err, req, res) {
    this.logger.error(err);

    res.status(500);
    res.end();
  }
}

module.exports = Query;
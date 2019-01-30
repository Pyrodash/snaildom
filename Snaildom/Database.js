'use strict';

const config = require('../config').database;
const logger = require('./Utils/Logger');

class Database {
  constructor() {
    this.knex = require('knex')({
      client: 'mysql',
      connection: {
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
      }
    });

    this.testConnection();
  }

  testConnection() {
    this.knex.raw('SELECT 1+1 AS result').then(() => {
      logger.write('Connected to the database.');
    }).catch(err => {
      logger.error(err);
      logger.fatal('Failed to connect to database.');
    });
  }

  getPlayer() {
    const args = Array.from(arguments);
    const where = {};

    const first = args[0];

    switch(typeof first) {
      case 'string':
      case 'number':
        if(args.length == 2)
          where[first] = args[1];
        else {
          const type = isNaN(first) ? 'Username' : 'ID';

          where[type] = first;
        }
      break;
      case 'object':
        where = first;
    }

    return this.knex('users').first('*').where(where);
  }

  addGold(player, amt) {
    const type = isNaN(player) ? 'Username' : 'ID';

    return this.knex('users').increment('Gold', amt).where(type, player).catch(logger.error);
  }

  removeGold(player, amt) {
    const type = isNaN(player) ? 'Username' : 'ID';

    return this.knex('users').decrement('Gold', amt).where(type, player).catch(logger.error);
  }

  updateColumn(player, col, val) {
    const type = isNaN(player) ? 'Username' : 'ID';
    const update = typeof col == 'object' ? col : {[col]: val};

    return this.knex('users').update(update).where(type, player).catch(logger.error);
  }

  getShell() {
    const args = Array.from(arguments);
    const where = {};

    const first = args[0];

    switch(typeof first) {
      case 'string':
      case 'number':
        if(args.length == 2)
          where[first] = args[1];
        else
          where['ID'] = first;
      break;
      case 'object':
        where = first;
    }

    return this.knex('shells').first('*').where(where);
  }

  createShell(shell) {
    return this.knex('shells').insert(shell).catch(logger.error);
  }
}

module.exports = Database;
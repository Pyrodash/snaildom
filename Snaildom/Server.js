'use strict';

const utils    = require('./Utils/Utils');
const config   = require('../config');

const Logger   = require('./Utils/Logger');

const Client   = require('./Client');
const World    = require('./World');

const redis    = require('redis');

const path     = require('path');
const net      = require('net');

const memwatch = require('node-memwatch');

class Server {
  constructor(world) {
    this.setInfo(world);
    this.clients = [];

    this.logger = new Logger(path.join(__dirname, 'Logs', 'world-' + world.id + '.txt'), config.logging.levels);

    memwatch.on('leak', info => {
      this.logger.warn('Memory leak detected!');

      console.log(info);
    });

    process.on('uncaughtException', err => {
      //this.logger.warn('Uncaught exception!!!');
      if(err.stack)
        err = err.stack;

      if(!this.logger || !this.logger.error)
        console.error(err);
      else
        this.logger.error(err);
    });

    process.on('SIGINT', this.handleShutdown.bind(this));
    process.on('SIGTERM', this.handleShutdown.bind(this));

    this.world = new World(this);

    this.createRedis();
    this.start();
  }

  setInfo(world) {
    this.id = world.id;

    this.port = world.port;
    this.name = world.name || 'Snaildom';

    this.info = world;

    if(this.redis)
      this.updateInfo();
  }

  start() {
    this.server = net.createServer(socket => {
      this.logger.write('A client has connected.');

      const client = new Client(socket, this);

      this.clients.push(client);
    }).listen(this.port, () => {
      this.logger.write(this.name + ' is listening on port ' + this.port + '.');
    });
  }

  getClient(prop, val) {
    if(!val && prop) {
      val = prop;
      prop = isNaN(val) ? 'username' : 'id';
    }

    if(!prop)
      return false;

    return this.clients.find(client => {
      var compare = val;

      if(client.authenticated != true)
        return false;

      if(client[prop] != undefined && !isNaN(client[prop]))
        compare = Number(compare);

      switch(typeof client[prop]) {
        case 'string':
          return client[prop].toLowerCase() == val.toLowerCase();
        break;
        default:
          return client[prop] == val;
      }
    });
  }

  removeClient(client) {
    this.clients = this.clients.filter(c => c != client && c.socket != client.socket && c.socket != client);
  }

  async createRedis() {
    if(!this.info.host)
      this.info.host = await utils.getIP();
    if(!config['redis'])
      config['redis'] = {};

    const conf = {};

    conf['host'] = config['redis']['host'] || '127.0.0.1';
    conf['port'] = config['redis']['port'] || '6379',
    conf['path'] = config['redis']['path'] || null;

    this.logger.createSubLevel({ name: 'redis', color: 'green', parent: 'info' })

    this.redis = redis.createClient(conf);
    this.redis.on('ready', () => {
      this.logger.redis('Connected to Redis.');

      this.updateInfo();
      this.updatePopulation();
    });

    this.redis.on('error', err => {
      if(err.stack) err = err.stack;

      this.logger.error(err);
    });
  }

  updateInfo(del) {
    return new Promise((resolve, reject) => {
      this.redis.get('servers', (err, servers) => {
        if(err) {
          this.logger.error(err.stack);
          this.logger.warn('Failed to update server stats.', {suffix: 'redis'});

          reject(err);
          // Don't wanna get an unhandled rejection
        } else {
          servers = utils.parse(servers, {});

          if(!del)
            servers[this.id] = this.info;
          else {
            servers[this.id] = null;
            delete servers[this.id];
          }

          this.redis.set('servers', JSON.stringify(servers), () => {
            this.logger.redis('Successfully updated server stats.');

            resolve();
          });
        }
      });
    });
  }

  updatePopulation() {
    // Thanks to Houdini (Ben & Arthur)

    const clients = this.clients.filter(client => client.authenticated).map(client => client.id);

    this.redis.set(this.id + '.population', clients.length);
    this.redis.set(this.id + '.players', JSON.stringify(clients));
  }

  async handleShutdown() {
    try {
      await this.logger.saveLoop();
      await this.updateInfo(true);
    } catch(err) {
      this.logger.error(err.stack);
      process.exit(1);
    }

    this.server.close();
    this.logger.warn('Shutting down...');

    process.exit(0);
  }
}

module.exports = Server;
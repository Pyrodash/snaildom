'use strict';

const logger = require('./Utils/Logger');

const Client = require('./Client');
const World  = require('./World');

const net    = require('net');

class Server {
  constructor(world) {
    this.id = world.id;

    this.port = world.port;
    this.name = world.name || 'Snaildom';

    this.clients = [];
    this.world = new World(this);

    this.start();
  }

  start() {
    this.server = net.createServer(socket => {
      logger.write('A client has connected.');

      const client = new Client(socket, this);

      this.clients.push(client);
    }).listen(this.port, () => {
      logger.write(this.name + ' is listening on port ' + this.port + '.');
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
}

module.exports = Server;
'use strict';

const config = require('../config');

const crypto = require('./Utils/Crypto');
const utils  = require('./Utils/Utils');

const reload = require('require-reload');

const CLI               = require('./CLI');

const DependencyManager = require('./Managers/Dependency');
const HandlerManager    = require('./Managers/Handler');
const PluginManager     = require('./Managers/Plugin');
const RoomManager       = require('./Managers/Room');
const EventEmitter      = require('events');

class World extends EventEmitter {
  constructor(server) {
    super();

    this.server = server;
    this.logger = server.logger;

    this.reloadDatabase();

    this.creationDate = new Date(1546275936813);
    this.era = config.era || {suffix: '', prefix: '', name: 'Beta Era'};

    this.cli = new CLI;
    this.cli.register('reload database', this.reloadDatabase.bind(this));

    this.roomManager = new RoomManager(this);
    this.dependencyManager = new DependencyManager(this);
    this.handlers = new HandlerManager(this);
    this.plugins = new PluginManager(this);
  }

  reloadDatabase() {
    const Database = reload('./Database');

    this.database = new Database(this.logger);
    this.emit('database reloaded', this.database);
  }

  process(data, client, bypass) {
    if(data == '<policy-file-request/>')
      return client.write('<cross-domain-policy><allow-access-from domain="*.' + (config.host || 'localhost') + '" to-ports="*" /></cross-domain-policy>');

    const now = new Date().getTime();

    if(client.isDead() && (!client.deathTime || (now - client.deathTime) > 5000))
      return this.logger.warn('Received packet from dead client ' + client.username + ': ' + data);

    var packet = data.slice(1);

    if(packet.charAt(packet.length - 1) == '@')
      packet = packet.slice(0, -1);

    packet = packet.split('@');

    var header = packet.shift();
    var footer = packet.pop();

    if(!header || !footer)
      return;

    var keyword = [header.substr(0, 3), footer.substr(0, 3)];

    const validHeader = header == keyword[0] + '_START';
    const validFooter = footer == keyword[1] + '_END';

    if(validHeader && validFooter && keyword[0] == keyword[1]) {
      keyword = bypass == true ? 'DAT' : keyword[0];
      packet = packet.join('@');

      switch(keyword) {
        case 'DAT':
          if(client.authenticated && !bypass)
            return this.logger.warn('Authenticated client tried to send an unencrypted packet.');

          this.logger.write('Received: ' + packet);
          packet = utils.parse(packet);

          if(!client.authenticated && packet.msg != 'login')
            return this.logger.warn('Unauthenticated client tried to send a packet they\'re not allowed to.');

          if(this.handle(packet, client))
            return;
        break;
        case 'ENC':
          if(!client.authenticated)
            return this.logger.warn('Unauthenticated client tried sending an encrypted packet.');
          if(!client.sessionKey) {
            client.disconnect();

            return this.logger.warn('Client ' + client.id + ' has no session key.');
          }

          packet = crypto.decode(packet, client.sessionKey).split('\0');

          for(var i in packet) {
            const subpacket = packet[i]

            if(subpacket && !utils.isEmpty(subpacket))
              this.process(subpacket, client, true);
          }

          return;
      }
    }

    this.logger.warn('Received invalid packet: ' + data);
  }

  handle(packet, client) {
    const action = packet.msg;
    const params = packet.params || {};

    if(action) {
      const handlers = this.handlers.find(action);

      if(handlers.length > 0) {
        for(var i in handlers) {
          try {
            handlers[i](params, client);
          } catch(e) {
            this.logger.error(e);
          }
        }
      } else
        this.logger.warn('Unhandled packet received: ' + action);

      return true;
    }

    return false;
  }

  getEra() {
    const oneDay = 24 * 60 * 60 * 1000;
    const days = Math.round(Math.abs((new Date().getTime() - this.creationDate.getTime()) / oneDay));

    return {
      days: days,
      start: this.creationDate.getTime() / 1000,
      prefix: this.era.prefix,
      name: this.era.name,
      suffix: this.era.suffix
    };
  }

  getVillage() {
    const shells = [];
    const clients = this.server.clients;

    for(var i in clients) {
      const client = clients[i];

      shells.push(client.build());
    }

    return shells;
  }
}

module.exports = World;
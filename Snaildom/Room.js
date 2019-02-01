'use strict';

const EventEmitter = require('events');
const utils        = require('./Utils/Utils');

class Room extends EventEmitter {
  constructor(crumbs, world) {
    super();

    this.world = world;

    this.server = world.server;
    this.database = world.database;

    this.clients = [];

    this.apply(crumbs);
  }

  apply(crumbs) {
    this.id = crumbs.id;
    this.name = crumbs.name;

    this.displayID = crumbs.displayID || this.id;

    this.isGame = Boolean(Number(crumbs.isGame));
    this.isShell = Boolean(Number(crumbs.isShell));
    this.nullGame = Boolean(Number(crumbs.nullGame));

    this.owner = crumbs.owner || {};
    this.crumbs = crumbs;
  }

  write(data, ignored) {
    for(var i in this.clients) {
      const client = this.clients[i];

      if(!ignored || client != ignored)
        client.write(data);
    }
  }

  send(action, params, ignored) {
    this.write({
      msg: action,
      params: params
    }, ignored);
  }

  add(client, x, y, frame) {
    if(client.room) {
      client.lastRoom = client.room;

      client.room.remove(client);
    }

    client.x = utils.parseInt(x);
    client.y = utils.parseInt(y);

    client.frame = utils.parseInt(frame, 1);
    client.score = 0;
    client.room  = this;
    client.roomJoin = new Date().getTime();

    this.clients.push(client);

    client.send('area', this.build());
    this.send('addplayer', client.build(true), client);

    this.emit('player joined', client);
    client.emit('joined room', this);
  }

  remove(client) {
    const i = this.clients.indexOf(client);

    if(i > -1) {
      this.clients.splice(i, 1);

      this.send('remove', {
        id: client.id,
        logout: client.socket ? false : true
      });
    }

    if(client.room == this)
      client.room = null;
  }

  build() {
    const players = this.clients.map(client => client.build()) || [];
    var   build = {
      id: this.displayID,
      name: this.name,
      isGame: this.isGame,
      isShell: this.isShell,
      nullGame: this.nullGame,
      players: players
    };

    if(this.customBuild) {
      const customBuild = {};

      for(var i in this.customBuild) {
        const prop = this.customBuild[i];

        this.parseProp(i, prop, customBuild);
      }

      build = {...build, ...customBuild};
    }

    return build;
  }

  parseProp(key, prop, location) {
    if(typeof prop == 'function')
      location[key] = prop(this);
    else if(typeof prop == 'object') {
      for(var i in prop) {
        parseProp(key, prop[i], location);
      }
    } else {
      switch(key) {
        case 'get':
          location[key] = this[prop];
        break;
        default:
          location[key] = prop;
      }
    }
  }
}

module.exports = Room;
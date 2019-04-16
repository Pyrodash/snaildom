'use strict';

const EventManager = require('../../../Utils/EventManager');

class Group extends EventManager {
  constructor(opts, game) {
    super();

    if(!opts)
      opts = {};

    if(opts.constructor.name != 'Object') {
      game = opts;
      opts = {};
    }

    this.game = game;
    this.logger = game.logger;

    this.started = false;
    this.clients = [];

    this.maxClients = opts.maxClients || 0;
    this.warps = opts.warps;

    this.sendLeave = opts.sendLeave != undefined ? Boolean(opts.sendLeave) : true;
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

  update(action, data, ignored) {
    if(!data)
      data = {};

    data['action'] = action;
    this.send('mgupdate', data, ignored);
  }

  add(client) {
    client.spectator = this.clients.length >= this.maxClients;

    this.clients.push(client);

    client.group = this;
    client.game = this.game;

    const data = {
      id: this.game.id,
      name: this.game.name,
      players: this.build()
    };

    if(this.joinArgs) {
      for(var i in joinArgs) {
        var arg = joinsArgs[i];

        if(typeof arg == 'function')
          arg = arg(client);

        if(arg)
          data[i] = arg;
      }
    }

    client.send('multigame', data);
    this.update('join', client.build(true));

    const seatId = this.clients.indexOf(client);

    if(this.warps && this.warps[seatId]) {
      const warp = this.warps[seatId];

      client.move(warp.x, warp.y);

      if(warp.frame)
        client.setFrame(warp.frame);
      if(warp.pushFrame)
        client.setPushFrame(warp.pushFrame);
    }

    this.emit('user added', client);

    if(this.clients.length >= this.maxClients && !this.started)
      this.emit('ready');
  }

  remove(client) {
    var isPlayer = false;
    this.clients = this.clients.filter(sclient => sclient != client && sclient.id != client.id);

    if(this.started === true && !client.spectator)
      isPlayer = true;

    client.group = null;
    client.game = null;
    client.spectator = null;

    this.emit('user removed', client);

    if(isPlayer && this.sendLeave)
      this.update('leave', client.build(true));
  }

  build() {
    return this.clients.map(client => client.build());
  }

  destroy() {
    this.removeEvents();
  }
}

module.exports = Group;
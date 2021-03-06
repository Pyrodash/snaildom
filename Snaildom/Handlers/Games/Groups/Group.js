'use strict';

const Persistent = require('../../../Utils/Persistent');

class Group extends Persistent {
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

    this.set({
      started: false,
      clients: [],
      maxClients: opts.maxClients || 0,
      warps: opts.warps,
      sendLeave: opts.sendLeave != undefined ? Boolean(opts.sendLeave) : true
    });
  }

  write(data, ignored) {
    const clients = this.get('clients');

    for(var i in clients) {
      const client = clients[i];

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
    const clients = this.get('clients');
    const maxClients = this.get('maxClients');

    client.spectator = clients.length >= maxClients;
    clients.push(client);

    this.depend(client, 'group');
    this.game.depend(client, 'game');

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

    const seatId = clients.indexOf(client);
    const warps = this.get('warps');

    if(warps && warps[seatId]) {
      const warp = warps[seatId];

      client.move(warp.x, warp.y);

      if(warp.frame)
        client.setFrame(warp.frame);
      if(warp.pushFrame)
        client.setPushFrame(warp.pushFrame);
    }

    this.emit('user added', client);

    if(clients.length >= maxClients && !this.get('started'))
      this.emit('ready');
  }

  remove(client) {
    var isPlayer = false;
    this.set('clients', this.get('clients').filter(sclient => sclient != client && sclient.id != client.id));

    if(this.started === true && !client.spectator)
      isPlayer = true;

    client.group = null;
    client.game = null;
    client.spectator = null;

    this.emit('user removed', client);

    if(isPlayer && this.get('sendLeave'))
      this.update('leave', client.build(true));
  }

  build() {
    return this.get('clients').map(client => client.build());
  }

  destroy() {
    this.removeEvents();
  }

  reload(oldGroup) {
    const clients = oldGroup.get('clients');

    for(var client of clients) {
      client.group = this;
    }
  }
}

module.exports = Group;
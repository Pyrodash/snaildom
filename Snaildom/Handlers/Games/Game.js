'use strict';

class Game {
  constructor(opts, world) {
    this.id = opts.id;
    this.name = opts.name || 'Game';
    this.groups = opts.groups || [];

    this.world = world;
  }

  find(group) {
    return this.groups[group];
  }

  add(client, group) {
    if(client && group !== undefined) {
      group = this.find(group);

      if(group)
        group.add(client);
    }
  }

  remove(client, group) {
    if(client && group) {
      group = this.find(group);

      if(group)
        group.remove(client);
    }
  }

  processUpdate(data, client) {
    if(client.group)
      client.group.emit('update', data, client);
  }
}

module.exports = Game;
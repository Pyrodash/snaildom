'use strict';

const Persistent = require('../../Utils/Persistent');

class Game extends Persistent {
  constructor(opts, world) {
    super();

    this.id = opts.id;
    this.name = opts.name || 'Game';

    this.set('groups', opts.groups || []);

    if(this.setup && typeof this.setup == 'function')
      this.setup();

    this.world = world;
    this.logger = world.logger;
  }

  find(group) {
    return this.get('groups')[group];
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
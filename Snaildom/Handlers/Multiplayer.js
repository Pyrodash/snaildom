'use strict';

const path       = require('path');
const logger     = require('../Utils/Logger');

const Handler    = require('../Handler');
const FileLoader = require('../Utils/FileLoader');

class Multiplayer extends Handler {
  constructor(world) {
    super(world);

    this.gameLoader = new FileLoader({
      name: 'game',
      path: path.join(__dirname, 'Games'),
      params: world,
      ignored: ['game'],
      cli: {
        cli: world.cli
      }
    });

    this.register('joinmg', 'handleJoin');
    this.register('leavemg', 'handleLeave');
  }

  find(id) {
    return this.gameLoader.storage.find(game => game.id.toLowerCase() == id.toLowerCase());
  }

  handleJoin(data, client) {
    const {group, name} = data;
    const game = this.find(name);

    if(game)
      game.add(client, group);
    else
      logger.warn('Player ' + client.getTag() + ' tried to join unknown game: ' + name);
  }

  handleLeave(data, client) {
    if(client.group)
      client.group.remove(client);
  }
}

module.exports = Multiplayer;
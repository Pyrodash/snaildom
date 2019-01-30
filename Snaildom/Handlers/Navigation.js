'use strict';

const Handler = require('../Handler')
const utils   = require('../Utils/Utils');

class Navigation extends Handler {
  constructor(world) {
    super(world);

    this.register('move', 'handleMove');
    this.register('warp', 'handleWarp');
  }

  handleMove(data, client) {
    const {x, y} = data;

    if(x && y)
      client.move(x, y);
  }

  handleWarp(data, client) {
    const {id} = data;

    client.joinRoom(id);
  }
}

module.exports = Navigation;
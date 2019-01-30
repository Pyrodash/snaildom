'use strict';

const Handler = require('../Handler');

class Game extends Handler {
  constructor(world) {
    super(world);

    this.register('gameupdate', 'handleUpdate');
  }

  handleUpdate(data, client) {
    
  }
}

module.exports = Game;
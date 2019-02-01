'use strict';

const Game  = require('./Game');
const Group = require('./Groups/Writing');

class Writing extends Game {
  constructor(world) {
    super({
      id: 'writing',
      name: 'Write with Me'
    }, world);

    this.groups = [
      new Group(null, this),
      new Group(null, this)
    ];
  }
}

module.exports = Writing;
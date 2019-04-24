'use strict';

const Game  = require('./Game');
const Group = require('./Groups/FindFour');

class FindFour extends Game {
  constructor(world) {
    super({
      id: 'connectfour', // isnt it called find four? @damen
      name: 'Connect Four'
    }, world);
  }

  setup() {
    this.set('groups', [
      new Group({
        warps: [
          {
            x: 173,
            y: 347,
            pushFrame: 8
          },
          {
            x: 307,
            y: 347,
            pushFrame: 2
          }
        ]
      }, this),
      new Group({
        warps: [
          {
            x: 400,
            y: 364,
            pushFrame: 5
          },
          {
            x: 415,
            y: 304,
            pushFrame: 2
          }
        ]
      }, this),
      new Group({
        warps: [
          {
            x: 503,
            y: 327,
            pushFrame: 8
          },
          {
            x: 612,
            y: 319,
            pushFrame: 2
          }
        ]
      }, this)
    ]);
  }
}

module.exports = FindFour;
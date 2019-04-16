'use strict';

const Dependency = require('../Dependency');
const Items      = require('../Crumbs/Items');

class Weapon extends Dependency {
  hasSword() {
    var hasSword = false;

    if(this.hasSword)
      hasSword = true;

    const item = Items[this.toy];

    if(item && item.isSword)
      hasSword = true;

    return hasSword;
  }

  thrust() {
    if(!this.room)
      return;

    this.room.send('thrust', {id: this.id});
  }
}

module.exports = Weapon;
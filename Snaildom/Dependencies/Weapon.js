'use strict';

const Dependency = require('../Dependency');

class Weapon extends Dependency {
  hasSword() {
    var hasSword = false;

    if(this.hasSword)
      hasSword = true;

    const item = this.crumbs.items[this.toy];

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
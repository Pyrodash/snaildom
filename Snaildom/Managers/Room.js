'use strict';

const Manager = require('../Manager');
const Room    = require('../Room');
const reload  = require('require-reload');

class RoomMgr extends Manager {
  constructor(world) {
    super(world);

    this.loadCrumbs();
  }

  loadCrumbs() {
    const crumbs = reload('../Crumbs/Rooms');
    const old = this.rooms || {};

    this.rooms = {};

    for(var i in crumbs) {
      const room = new Room(crumbs[i], this.world);
      const oldRoom = old[i] || {};

      if(oldRoom.clients && oldRoom.clients.length > 0)
        room.clients = [...room.clients, oldRoom.clients];

      this.rooms[i] = room;
    }
  }

  find(r) {
    for(var i in this.rooms) {
      const room = this.rooms[i];

      if(i == r || room.id == r || room.internal == r)
        return room;
    }

    return false;
  }

  random() {
    const keys = Object.keys(this.rooms).filter(id => this.rooms[id] && !this.rooms[id].isGame);

    return this.rooms[keys[keys.length * Math.random() << 0]];
  }
}

module.exports = RoomMgr;
'use strict';

const Dependency = require('../Dependency');

class Room extends Dependency {
  joinRoom(room, x, y, frame) {
    if(typeof room == 'string' && room.startsWith('shell_')) {
      var owner = Number(room.split('shell_').pop());

      if(owner && !isNaN(owner)) {
        owner = this.server.getClient(owner);

        if(owner)
          return owner.myShell ? this.joinRoom(owner.myShell) : owner.createShell().then(this.joinRoom.bind(this));
        else
          return this.joinRoom();
      }
    }

    if(typeof room == 'object' && room.add && typeof room.add == 'function')
      return room.add(this, x, y, frame);

    if(!room)
      return this.roomManager.random().add(this, x, y, frame);

    room = this.roomManager.find(room);

    if(room)
      room.add(this, x, y, frame);
    else {
      if(this.room)
        this.room.add(this, x, y, frame);
      else
        this.roomManager.random().add(this, x, y, frame);
    }
  }
}

module.exports = Room;
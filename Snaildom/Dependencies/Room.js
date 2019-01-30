'use strict';

const Dependency = require('../Dependency');

class Room extends Dependency {
  joinRoom(room) {
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
      return room.add(this);

    if(!room)
      return this.roomManager.random().add(this);

    room = this.roomManager.find(room);

    if(room)
      room.add(this);
    else {
      if(this.room)
        this.room.add(this);
      else
        this.roomManager.random().add(this);
    }
  }
}

module.exports = Room;
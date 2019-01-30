'use strict';

const utils   = require('../Utils/Utils');
const Handler = require('../Handler');

class Shell extends Handler {
  constructor(world) {
    super(world);

    this.register('update-shell-art', 'handleUpdateArt');
  }

  handleUpdateArt(data, client) {
    const art = data.shellArt;
    const myShell = 'shell_' + client.id;

    if(client.room.id == myShell) {
      client.room.furniture = utils.parseFurniture(art);

      client.room.updateColumn('Furniture', art);
      client.room.send('update-shell-art', {
        shellArt: client.room.furniture
      });
    }
  }
}

module.exports = Shell;
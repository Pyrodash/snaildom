'use strict';

const reload = require('require-reload')(require);
const Client = require('../../Snaildom/Client');

const utils  = reload('./utils');

class NPC extends Client {
  constructor(Player, server) {
    super(null, server, true);

    if(!Player.ID)
      Player.ID = utils.rand(1000000, 9999999);

    this.authenticated = true;
    this.dialogue = utils.parseTopic(Player.Dialogue);

    this.setPlayer(Player);
    this.joinRoom(Player.Room, Player.X, Player.Y, Player.Frame)
  }
}

module.exports = NPC;
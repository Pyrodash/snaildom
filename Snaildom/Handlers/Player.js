'use strict';

const Handler = require('../Handler');
const utils   = require('../Utils/Utils');

class Player extends Handler {
  constructor(world) {
    super(world);

    this.register('frame', 'handleFrame');
    this.register('equip', 'handleEquip');
  }

  handleFrame(data, client) {
    const {falseCallBack, frame} = data;

    // Not sure what false callback is..

    if(utils.isNumber(frame))
      client.setFrame(frame, true);
  }

  handleEquip(data, client) {
    const {id} = data;

    if(id)
      client.equip(id);
  }
}

module.exports = Player;
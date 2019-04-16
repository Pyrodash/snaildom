'use strict';

const Handler = require('../Handler');

const utils   = require('../Utils/Utils');
const filter  = require('../Utils/Filter');

class Player extends Handler {
  constructor(world) {
    super(world);

    this.register('frame', 'handleFrame');
    this.register('equip', 'handleEquip');
    this.register('about', 'handleAbout');
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

  handleAbout(data, client) {
    var {about} = data;

    if(about && !utils.isEmpty(about)) {
      about = utils.replaceUnicode(about);

      if(filter.isProfane(about) && client.rank < 2) {
        about = filter.clean(about);

        client.alert(
          '<b>Warning</b>' +
          '<br><br>Bad language is strictly forbidden. Help us keep this a safe and friendly environment for children rather than a toxic one.',
        'moderator');
      }

      client.update('about', about);
      client.updatePlayer();
    }
  }
}

module.exports = Player;
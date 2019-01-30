'use strict';

const Handler = require('../Handler');
const reload  = require('require-reload');
const utils   = require('../Utils/Utils');
const filter  = reload('../Utils/Filter');

class Message extends Handler {
  constructor(world) {
    super(world);

    this.register('chat', 'handleMessage');
    this.register('emote', 'handleEmote');
  }

  handleMessage(data, client) {
    var msg = data.message;

    if(msg) {
      msg = utils.replaceUnicode(msg);

      if(filter.isProfane(msg) && client.rank < 2) {
        msg = filter.clean(msg);

        client.alert(
          '<b>Warning</b>' +
          '<br><br>Bad language is strictly forbidden. Help us keep this a safe and friendly environment for children rather than a toxic one.',
        'moderator');
      }

      client.say(msg);
    }
  }

  handleEmote(data, client) {
    const {emote} = data;
    const emotes = ['happy', 'smile', 'sad', 'silly', 'gasp', 'smirk', 'hmph', 'food_burger', 'drink_ale', 'food_chicken', 'food_chips', 'food_cake', 'food_noodles', 'drink_wine', 'drink_water', 'drink_grapejuice', 'mine', 'tired', 'cry', 'straight', 'food_popcorn', 'cat', 'mad', 'shy', 'wink', 'risky', 'nerd', 'heart', 'up', 'down', 'question', 'alert', 'snail', 'football', 'drink_quG_potion', 'drink_potion1_qeG', 'drink_potion2_qeG', 'drink_potion3_qeG', 'drink_potion4_qeG'];

    if(emotes.includes(emote)) {
      client.room.send('emote', {
        id: client.id,
        emote: emote
      }, client);
    }
  }
}

module.exports = Message;
'use strict';

const utils  = require('../../../Utils/Utils');
const filter = require('../../../Utils/Filter');

const Group  = require('./Group');

class Writing extends Group {
  constructor(opts, game) {
    if(!opts)
      opts = {};

    super({...opts, maxClients: 2}, game);

    this.registerEvents();
  }

  onUpdate(data, client) {
    const {action} = data;

    switch(action) {
      case 'ready':
        this.start();
      break;
      case 'submit':
        var   {message} = data;
        const seatId = this.clients.indexOf(client) + 1;

        if(seatId == this.turn) {
          ++this.round;
          message = utils.replaceUnicode(message);

          if(utils.isEmpty(message))
            message = '';

          if(filter.isProfane(message) && client.rank < 2) {
            message = filter.clean(message);

            client.alert(
              '<b>Warning</b>' +
              '<br><br>Bad language is strictly forbidden. Help us keep this a safe and friendly environment for children rather than a toxic one.',
            'moderator');
          }

          if(message.length > 100)
            message = message.substr(0, 100);

          message = utils.escapeHTML(message);

          this.body += message;
          this.turn = seatId == 2 ? 1 : 2;

          //if(this.round < this.maxRounds)
            this.update('continue', {
              body: this.body,
              turn: this.turn
            });
          //else
            //this.end();
        }
    }
  }

  onUserLeft(client) {
    this.end();
  }

  start() {
    this.reset();

    this.turn = 1;
    this.round = 0;
    //this.maxRounds = utils.rand(10, 25);
    this.started = true;

    this.update('begin', {
      turn: this.turn,
      body: this.body
    });

    // TODO: Round timer
  }

  end() {
    this.body += '<br><br>';

    this.update('theend', {
      body: this.body,
      story: this.body + 'The End!'
    });
    this.reset();
  }

  reset() {
    this.body = '<b>Once upon a time</b> '; // Not sure if I should always have an intro. Perhaps a randomized one from an array of intros?
    this.started = false;
    this.turn = null;
  }

  registerEvents() {
    this.addEvent(this, 'user removed', this.onUserLeft.bind(this));
    this.addEvent(this, 'update', this.onUpdate.bind(this));
  }
}

module.exports = Writing;
'use strict';

const utils  = require('../../../Utils/Utils');
const filter = require('../../../Utils/Filter');

const Group  = require('./Group');

class Writing extends Group {
  constructor(opts, game) {
    if(!opts)
      opts = {};

    super({...opts, maxClients: 2, sendLeave: false}, game);

    this.registerEvents();
  }

  onUpdate(data, client) {
    const {action} = data;

    const clients = this.get('clients');
    const turn = this.get('turn');

    switch(action) {
      case 'ready':
        this.start();
      break;
      case 'submit':
        var   {message} = data;
        const seatId = clients.indexOf(client) + 1;

        if(seatId == turn) {
          this.increment('round');
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

          this.add('body', message);
          this.set('turn', seatId == 2 ? 1 : 2);

          if(this.get('round') < this.get('maxRounds'))
            this.update('continue', {
              body: this.get('body'),
              turn: this.get('turn')
            });
          else
            this.end();
        }
    }
  }

  onUserLeft(client) {
    this.end();
  }

  start() {
    this.reset();

    this.set('turn', 1);
    this.set('round', 0);
    this.set('maxRounds', utils.rand(10, 25));
    this.set('started', true);

    this.update('begin', {
      turn: this.get('turn'),
      body: this.get('body')
    });

    // TODO: Round timer
  }

  end() {
    this.add('body', '<br><br>');
    const body = this.get('body');

    this.update('theend', {
      body: body,
      story: body + 'The End!'
    });
    this.reset();
  }

  reset() {
    this.set('body', '<b>Once upon a time</b> '); // Not sure if I should always have an intro. Perhaps a randomized one from an array of intros?
    this.set('started', false);
    this.set('turn', null);
  }

  registerEvents() {
    this.addEvent(this, 'user removed', this.onUserLeft.bind(this));
    this.addEvent(this, 'update', this.onUpdate.bind(this));
  }
}

module.exports = Writing;
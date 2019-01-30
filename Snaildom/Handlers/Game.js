'use strict';

const Handler = require('../Handler');
const logger  = require('../Utils/Logger');

class Game extends Handler {
  constructor(world) {
    super(world);

    this.games = {
      'marksman': 'handleMarksman',
      'snaildrop': 'handleSnaildrop',
      'railandcart': 'handleCart'
    };
    this.register('gameupdate', 'handleUpdate');
  }

  handleUpdate(data, client) {
    if(client.room.isGame) {
      const game = client.room.id;

      if(this.games[game]) {
        if(!client.score)
          client.score = 0;

        var handler = this.games[game];

        if(typeof handler == 'string') {
          if(this[handler] && typeof this[handler] == 'function')
            handler = this[handler].bind(this);
        }

        if(typeof handler == 'function')
          handler(data, client);
      } else
        logger.warn('Player ' + client.id + ':' + client.username + ' is playing an unknown game. ID: ' + client.room.id);
    }
  }

  handleMarksman(data, client) {
    const {action} = data;

    switch(action) {
      case 'hit':
        const target = data.id;
        const targets = {
          bird: 10,
          target: 10,
          target2: 15
        };

        if(targets[target])
          client.score += targets[target];
      break;
      case 'leave':
        const earned = Math.round(client.score * 0.5);

        client.score = 0;

        client.addGold(earned);
        client.joinRoom('west_forest');
    }
  }

  handleSnaildrop(data, client) {
    const {action} = data;

    switch(action) {
      case 'retrylevel':
        const score = Number(data.score);
        client.score += score;
      break;
      case 'leave':
        client.addGold(client.score * 4);
        client.joinRoom('courtyard');
    }
  }

  handleCart(data, client) {
    const {action} = data;

    switch(action) {
      case 'mine':
        const {type} = data;

        switch(type) {
          case 'rock':
            client.score += 10;
          break;
          case 'iron':
            client.addMaterial('iron', 1, false);
          break;
          case 'silver':
            client.addMaterial('silver', 1, false);
          break;
          case 'gold':
            client.addMaterial('gold', 1, false);
        }
      break;
      case 'cart':
        client.score += 15;
      break;
      case 'reset':
        client.updateColumn('Materials', JSON.stringify(client.materials));
      break;
      case 'leave':
        const earned = Math.round(client.score / 4);

        client.addGold(earned);
        client.joinRoom('blackmine');
    }
  }
}

module.exports = Game;
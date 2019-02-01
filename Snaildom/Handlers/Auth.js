'use strict';

const Handler   = require('../Handler');

const items     = require('../Crumbs/Items');
const furniture = require('../Crumbs/Furniture');
const factions  = require('../Crumbs/Factions');

const logger    = require('../Utils/Logger');

class Auth extends Handler {
  constructor(world) {
    super(world);

    this.register('login', 'handleLogin');
  }

  handleLogin(data, client) {
    const loginKey  = data.playerkey;
    const cipherKey = data.playerkey2;

    const fail = err => {
      logger.error(err);
      console.log(err.stack);

      client.error(null, true);
    };

    this.database.getPlayer('LoginKey', loginKey)
      .then(player => {
        if(!player)
          return client.error(null, true);
        if(player.Dead == 1)
          return client.fatal('This snail is dead. Please make another one until this one is healed.', true);

        this.database.getBan(player.ID).then(Ban => {
          if(Ban) {
            if(Ban.Length == 999)
              client.fatal('This account is permanently banned.', true);
            else
              client.fatal('This account is banned for ' + Ban.Length + ' hours.', true);

            return;
          }

          client.authenticated = true;
          client.setPlayer(player);

          client.send('items', {
            items: items,
            furniture: furniture,
            factions: factions
          });

          client.refreshWorld();
          client.refreshFriends();
          client.joinRoom();

          for(var i in client.friends) {
            const friend = this.server.getClient(client.friends[i]);

            if(friend) {
              friend.send('friend-online', {
                id: client.id,
                name: client.username,
                area: client.room.name
              });
            }
          }
        }).catch(fail);
      })
      .catch(fail);
  }
}

module.exports = Auth;
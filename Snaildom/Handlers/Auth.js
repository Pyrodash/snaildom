'use strict';

const Handler   = require('../Handler');

const items     = require('../Crumbs/Items');
const furniture = require('../Crumbs/Furniture');
const factions  = require('../Crumbs/Factions');

const logger    = require('../Utils/Logger');

class Auth extends Handler {
  constructor(world) {
    super(world);

    this.creationDate = new Date(1546275936813);

    this.register('login', 'handleLogin');
  }

  handleLogin(data, client) {
    const loginKey  = data.playerkey;
    const cipherKey = data.playerkey2;

    const days = Math.floor(this.creationDate/8.64e7) + 1;

    this.database.getPlayer('LoginKey', loginKey)
      .then(player => {
        if(!player)
          return client.error(null, true);

        client.authenticated = true;
        client.setPlayer(player);

        client.send('items', {
          items: items,
          furniture: furniture,
          factions: factions
        });
        client.send('world', {
          era: {
            days: days,
            start: this.creationDate.getTime() / 1000,
            prefix: '',
            name: 'Beta Era',
            suffix: ''
          }
        });

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
      })
      .catch(err => {
        logger.error(err);
        console.log(err.stack);

        client.error(null, true);
      });
  }
}

module.exports = Auth;
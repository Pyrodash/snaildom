'use strict';

const Handler = require('../Handler');

const reload  = require('require-reload')(require);
const utils   = reload('../Utils/Utils');

class Auth extends Handler {
  constructor(world) {
    super(world);

    this.register('login', 'handleLogin');
  }

  async handleLogin(data, client) {
    const {captcha} = data;
    const loginKey  = data.playerkey;
    const cipherKey = data.playerkey2;

    const fail = err => {
      if(err)
        this.logger.error(err.stack);

      client.error(null, true);
    };

    if(this.world.recaptcha) {
      if(!captcha)
        return fail();

      try {
        const valid = await utils.validateCaptcha(captcha, client.ip, this.world.recaptcha);

        if(!valid)
          return fail();
      } catch(err) {
        return fail(err);
      }
    }

    this.database.getPlayer('LoginKey', loginKey)
      .then(player => {
        if(!player)
          return client.error(null, true);
        if(player.Dead == 1)
          return client.fatal('This snail is dead. Please make another one until this one is healed.', true);

        if(this.world.info.rank) {
          const rank = this.world.info.rank;

          if(player.Rank < rank)
            return client.disconnect();
        }

        this.database.getBan(player.ID).then(Ban => {
          if(Ban) {
            if(Ban.Length == 999)
              client.fatal('This account is permanently banned.', true);
            else
              client.fatal('This account is banned for ' + Ban.Length + ' hours.', true);

            return;
          }

          const sclient = this.server.getClient(player.ID);

          if(sclient)
            sclient.fatal('You have logged into this snail on another computer/window. You have been logged out.', true);

          client.authenticated = true;

          client.setPlayer(player);
          client.updateColumn('IP', client.ip);

          this.server.updatePopulation();

          client.send('items', this.crumbs.build());

          client.refreshWorld();
          client.refreshFriends();
          client.joinRoom(this.world.info.spawn);

          if(!client.tutorial)
            client.addQuest(1, false);

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
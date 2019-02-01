'use strict';

const logger  = require('../Utils/Logger');
const Handler = require('../Handler');

class Weapon extends Handler {
  constructor(world) {
    super(world);

    // This is only a handler by itself because I'm planning to add more complexity to weapons in the future like blocking. If I don't, should probably merge this with another handler.

    this.staggers = ["*ouch!*", "*ooph*", "*GAahhh!*", "*OUCHH*", "*blaghh*", "*hummph*"];
    this.damages = {
      sword: 21
    };

    this.register('thrust', 'handleThrust');
  }

  stagger() {
    return this.staggers[Math.floor(Math.random() * this.staggers.length)];
  }

  handleThrust(data, client) {
    if(client.hasSword()) {
      client.thrust();
      const {victims} = data;

      for(var i in victims) {
        const victim = victims[i];
        const sclient = this.server.getClient(victim);

        if(sclient) {
          if(sclient.isDead())
            continue;

          const damage = this.damages[client.toy] || 15;

          sclient.health -= damage;
          sclient.say(this.stagger(), false);

          if(sclient.health <= 0)
            sclient.die();
        } else
          logger.warn(client.getTag() + ' tried to damage non-existent user ' + victim);
      }
    }
  }
}

module.exports = Weapon;
'use strict';

const NPC     = require('./NPC');

const utils   = require('../../Snaildom/Utils/Utils');
const maxDist = 45;

class AI extends NPC {
  constructor(Player, server) {
    super(Player, server);

    this.mode = Player.Mode || 'idle';
    this.messages = Player.Messages || [];
    this.onTargetMove = this.onTargetMove.bind(this);

    this.next(false);

    if(this.room) {
      this.addEvent(this.room, 'player joined', this.onPlayerJoined.bind(this));
      this.addEvent(this.room, 'player left', this.onPlayerLeft.bind(this));
    }

    if(this.messages.length > 0)
      this.nextMessage(false);
  }

  nextMessage(send) {
    if(send != false) {
      const message = this.messages[Math.floor(Math.random() * this.messages.length)];

      if(message)
        this.say(message);
    }

    setTimeout(this.nextMessage.bind(this), utils.rand(8 * 1000, 15 * 1000));
  }

  async next(act) {
    if(this.diconnected)
      return;

    if(act != false) {
      try {
        await this.act();
      } catch(e) {
        this.logger.error(e.stack);
      }
    }

    var time;

    switch(this.mode) {
      case 'idle':
        time = utils.rand(8 * 1000, 20 * 1000);
      break;
      case 'aggressive':
        time = utils.rand(1 * 1000, 8 * 1000);
    }

    this.timeout = setTimeout(this.next.bind(this), time);
  }

  async moveTo(player) {
    if(!player)
      return;

    const offset = 40;

    var x = player.x;
    var y = player.y;

    const angle = utils.findAngle(this.x, this.y, x, y);
    const direction = utils.findDirection(angle);

    switch(direction) {
      case 1:
        y -= offset;
      break;
      case 2:
      case 3:
      case 4:
        x += offset;
      break;
      case 5:
        y += offset;
      break;
      case 6:
      case 7:
      case 8:
        x -= offset;
    }

    if(x <= 20 || x >= 740)
      x = utils.rand(100, 700);

    if(y <= 20 || y >= 460)
      y = utils.rand(100, 400);

    this.setFrame(direction);
    await this.move(x, y);
  }

  async attack(target) {
    if(!target)
      return;

    const dist = utils.findDistance(this, target);
    var thrust = this.world.handlers.find('thrust');

    const angle = utils.findAngle(this.x, this.y, target.x, target.y);
    const direction = utils.findDirection(angle);

    if(!thrust || thrust.length == 0)
      return this.logger.warn('Weapon Handler not found.');
    if(thrust.constructor === Array)
      thrust = thrust[0];

    if(dist < maxDist) {
      this.setFrame(direction + 10);
      await utils.sleep(20); // Make sure the player has turned

      thrust({victims: [target.id]}, this);
    } else
      await this.moveTo(target)
  }

  untarget() {
    this.removeEvent(this.target, 'moving', this.onTargetMove);
    this.target = null;
  }

  async retarget() {
    const clients = this.room.clients.filter(client => !client.dummy && client.x && client.y);
    const target = clients[Math.floor(Math.random() * clients.length)];

    if(target) {
      if(this.target)
        this.untarget();

      this.target = target;

      this.addEvent(this.target, 'moving', this.onTargetMove);
      await this.onTargetMove();
    } else
      await this.act('idle');
  }

  async act(mode) {
    if(this.disconnected)
      return;
    if(!mode)
      mode = this.mode;

    switch(mode) {
      case 'idle':
        await this.move(utils.randX(), utils.randY());
      break;
      case 'aggressive':
        if(this.target)
          await this.attack(this.target);
        else
          await this.retarget();
    }
  }

  async onTargetMove(x, y) {
    if(!this.target)
      return this.untarget();

    const target = this.target;
    const dist = utils.findDistance(this, target);

    if(dist > maxDist) {
      const duration = utils.getDuration(this.x, this.y, target.x, target.y);

      await utils.sleep(utils.rand(duration / 2, duration));
      await this.moveTo(target);
    } else {
      const angle = utils.findAngle(this.x, this.y, target.x, target.y);
      const direction = utils.findDirection(angle);

      this.setFrame(direction);
    }
  }

  onPlayerJoined(client) {
    if(client == this)
      return;

    if(!this.target)
      this.retarget();
  }

  onPlayerLeft(client) {
    if(client == this)
      return;

    if(this.target == client)
      this.untarget();
  }

  destroy() {
    super.destroy();

    clearTimeout(this.timeout);
    this.timeout = null;
  }
}

module.exports = AI;
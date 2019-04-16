'use strict';

const Dependency = require('../Dependency');
const Promise    = require('bluebird');

const crypto     = require('../Utils/Crypto');
const utils      = require('../Utils/Utils');

class Core extends Dependency {
  construct() {
    this.x = 0;
    this.y = 0;
    this.frame = 1;
    this.pushFrame = 0;
    this.dead = false;

    this.requests = {
      inbound: [],
      outbound: []
    };
  }

  write(data) {
    if(this.dummy)
      return;
    if(typeof data == 'object')
      data = JSON.stringify(data);

    this.logger.write('Sent: ' + data);

    if(this.sessionKey) {
      data = crypto.encode(data, this.sessionKey);
      data = '@ENC_START@' + data + '@ENC_END@';
    }

    this.socket.write(data + '\0');
  }

  send(action, params) {
    return this.write({
      msg: action,
      params: params || {}
    });
  }

  error(code, disconnect) {
    if(!code)
      code = 'none';

    this.send('error', {
      error: code
    });

    if(disconnect == true)
      this.disconnect();
  }

  fatal(msg, disconnect) {
    if(disconnect != true)
      disconnect = false;

    this.send('messageerror', {
      message: msg,
      dc: disconnect
    });

    if(disconnect)
      setTimeout(this.disconnect.bind(this), 5000); // Auto dc if the client doesn't
  }

  get(key) {
    switch(key) {
      case 'factions':
        return this.getFactions();
      break;
      case 'quests':
        const era = this.world.getEra();

        return this.quests.map(quest => {
          if(!quest.day)
            quest.day = era.days;
          if(!quest.era)
            quest.era = era.prefix + era.name + era.suffix;

          return quest;
        });
      break;
      default:
        return this[key];
    }
  }

  setPlayer(Player) {
    this.id = Number(Player.ID);
    this.username = Player.Username;

    this.head = Player.Head;
    this.face = Player.Face;
    this.body = Player.Body;
    this.toy  = Player.Toy;
    this.shell = Player.Shell;

    this.gold  = Number(Player.Gold);

    this.level = Number(Player.Level);
    this.exp   = Number(Player.Exp);

    this.color = Player.Color || null;
    this.subtitle = Player.Subtitle || null;

    this.rank = Number(Player.Rank) || 1;
    this.about = Player.About || null;

    this.royal = Number(Player.Royal);
    this.famous = Number(Player.Famous);

    this.knight = Number(Player.Knight);
    this.ghost = Number(Player.Ghost);
    this.iceghost = Number(Player.IceGhost);

    this.health = utils.parseInt(Player.Health, 100);
    this.tutorial = Number(Player.Tutorial) || 0;

    if(Player.SessionKey)
      this.sessionKey = crypto.snailFeed(Player.SessionKey);

    this.inventory = Player.Inventory ? Player.Inventory.split(',').filter(item => item) : [];
    this.furniture = Player.Furniture ? Player.Furniture.split(',').filter(item => item) : [];
    this.factions = Player.Factions ? this.parseFactions(Player.Factions.split(',').filter(faction => faction)) : [];

    this.friends = Player.Friends ? Player.Friends.split(',').filter(f => f).map(f => Number(f)) : [];
    this.blocked = Player.Blocked ? Player.Blocked.split(',').filter(b => b).map(b => Number(b)) : [];
    this.quests = !Player.Quests ? [] : Player.Quests.split(',').filter(q => q).map(q => {
      const quest = q.split(':');

      return {
        id: Number(quest[0]),
        stage: Number(quest[1]),
        priority: !isNaN(quest[2]) ? Number(quest[2]) : 0
      };
    });

    this.materials = utils.parse(Player.Materials, {
      iron: 0,
      silver: 0,
      gold: 0
    });

    for(var i in this.materials) {
      this.materials[i] = Number(this.materials[i]) || 0;
    }
  }

  build(inContainer, caps) {
    // TODO: Create a player model for data validation and serialization

    if(inContainer)
      return {player: this.build()}

    if(caps) {
      const player = this.build();
      const plr = {};

      for(var i in player) {
        var key = utils.ucfirst(i);

        if(i == 'id')
          key = key.toUpperCase();

        plr[key] = player[i];
      }

      return plr;
    }

    return {
      id: this.id,
      username: this.username,
      x: this.x,
      y: this.y,
      frame: this.frame,
      pushFrame: this.pushFrame,
      head: this.head,
      face: this.face,
      body: this.body,
      toy: this.toy,
      shell: this.shell,
      friends: this.friends,
      blocked: this.blocked,
      quests: this.get('quests'),
      inventory: this.get('inventory'),
      furniture: this.get('furniture'),
      factions: this.get('factions'),
      color: this.color,
      subtitle: this.subtitle,
      rank: this.rank,
      about: this.about,
      level: this.level,
      gold: this.gold,
      knight: this.knight,
      royal: this.royal,
      famous: this.famous,
      ghost: this.ghost,
      iceghost: this.iceghost,
      seat: this.seat || null,
      dummy: Number(this.dummy),
      online: this.socket ? true : Boolean(this.dummy)
    }
  }

  getTag() {
    return this.id + '|' + this.username;
  }

  async move(x, y) {
    if(!this.room)
      return;

    if(utils.isNumber(x) && utils.isNumber(y)) {
      const duration = utils.getDuration(this.x, this.y, x, y);

      this.x = Number(x);
      this.y = Number(y);

      this.room.send('move', {
        id: this.id,
        x: x,
        y: y
      });

      this.emit('moving', x, y);
      await utils.sleep(duration);
      this.emit('move', x, y);
    }
  }

  setFrame(frame, ignored) {
    if(!this.room)
      return;
    if(ignored === true)
      ignored = this;

    this.frame = Number(frame);
    this.room.send('frame', {
      id: this.id,
      frame: frame
    }, ignored);
  }

  setPushFrame(frame, ignored) {
    if(!this.room)
      return;
    if(ignored === true)
      ignored = this;

    this.pushFrame = Number(frame);
    this.room.send('pushframe', {
      id: this.id,
      frame: frame
    }, ignored);
  }

  say(msg, ignore) {
    if(ignore != false)
      ignore = this;
    else
      ignore = null;

    if(this.room) {
      this.room.send('chat', {
        id: this.id,
        message: msg
      }, ignore);
    }
  }

  die() {
    this.health = 0;
    this.dead = true;
    this.deathTime = new Date().getTime();

    this.updateColumn('Dead', 1);
    this.send('death');

    this.disconnect();
  }

  isDead() {
    return this.health <= 0 || this.dead;
  }

  refreshWorld() {
    this.send('world', {
      era: this.world.getEra(),
      village: this.world.getVillage()
    });
  }

  update(col, val) {
    this[col] = val;

    this.updateColumn(utils.ucfirst(col), val);
  }

  updateColumn(col, val) {
    return this.database.updateColumn(this.id, col, val);
  }

  updatePlayer() {
    this.room.send('update-snail', this.build());
  }

  disconnect() {
    this.server.removeClient(this);
    this.destroy();

    if(this.socket) {
      if(this.socket.writable) {
        this.socket.destroy();

        return;
      }

      this.socket = false;
    }

    if(this.room)
      this.room.remove(this);

    if(this.friends) {
      for(var i in this.friends) {
        const client = this.server.getClient(this.friends[i]);

        if(client) {
          client.send('remove', {
            id: this.id,
            logout: true
          });
        }
      }

      this.friends = null;
    }

    if(this.group)
      this.group.remove(this);

    this.authenticated = false;
    this.disconnected = true;
    
    this.emit('disconnected');
  }

  kick(reason) {
    this.send('kick', {reason});

    setTimeout(this.disconnect.bind(this), 1000);
  }

  ban(reason, issuer, length) {
    this.send('ban', {reason, hours: length});
    this.database.addBan({ User: this.id, Issuer: issuer, Reason: reason, Length: length, Active: 1 });

    setTimeout(this.disconnect.bind(this), 1000);
  }
}

module.exports = Core;
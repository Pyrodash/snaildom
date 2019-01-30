'use strict';

const Dependency = require('../Dependency');
const Promise    = require('bluebird');

const logger     = require('../Utils/Logger');
const crypto     = require('../Utils/Crypto');
const utils      = require('../Utils/Utils');

class Core extends Dependency {
  construct() {
    this.x = 0;
    this.y = 0;
    this.frame = 1;
    this.pushFrame = 0;

    this.requests = {
      inbound: [],
      outbound: []
    };
  }

  write(data) {
    if(typeof data == 'object')
      data = JSON.stringify(data);

    logger.write('Sent: ' + data);

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

    this.write({
      msg: "error",
      params: {
        error: code
      }
    });

    if(disconnect == true)
      this.disconnect();
  }

  get(key) {
    switch(key) {
      case 'factions':
        return this.getFactions();
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

    this.rank = Number(Player.Rank);
    this.about = Player.About || null;

    this.royal = Number(Player.Royal);
    this.famous = Number(Player.Famous);

    this.knight = Number(Player.Knight);
    this.ghost = Number(Player.Ghost);
    this.iceghost = Number(Player.IceGhost);

    this.sessionKey = crypto.snailFeed(Player.SessionKey);

    this.inventory = Player.Inventory.split(',').filter(item => item);
    this.furniture = Player.Furniture.split(',').filter(item => item);
    this.factions = this.parseFactions(Player.Factions.split(',').filter(faction => faction));

    this.friends = Player.Friends.split(',').filter(f => f).map(f => Number(f));
    this.blocked = Player.Blocked.split(',').filter(b => b).map(b => Number(b));

    this.materials = utils.parse(Player.Materials, {
      iron: 0,
      silver: 0,
      gold: 0
    });
  }

  build(inContainer) {
    if(inContainer)
      return {player: this.build()}

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
      dummy: this.dummy,
      online: this.socket ? true : false
    }
  }

  move(x, y) {
    if(!this.room)
      return;

    if(utils.isNumber(x) && utils.isNumber(y)) {
      this.x = Number(x);
      this.y = Number(y);

      this.room.send('move', {
        id: this.id,
        x: x,
        y: y
      });
    }
  }

  say(msg) {
    if(this.room) {
      this.room.send('chat', {
        id: this.id,
        message: msg
      }, this);
    }
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
    }

    this.authenticated = false;
  }
}

module.exports = Core;
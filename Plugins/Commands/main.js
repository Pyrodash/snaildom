'use strict';

const Plugin = require('../Plugin');

const utils  = require('../../Snaildom/Utils/Utils');
const filter = require('../../Snaildom/Utils/Filter');

class Commands extends Plugin {
  constructor(manager) {
    super('commands', __dirname, manager);
    this.depend('handler', 'moderation');

    this.prefix = this.get('prefix') || '/';
    this.commands = {
      'gg': 'handleGiveGold',
      'gt': 'handleGiveTitle',
      'gc': 'handleGiveColor',
      'jr': 'handleJoinRoom',
      'am': 'handleAddMaterial',
      'rejoin': 'handleRejoin',
      'revive': 'handleRevive',
      'warn': 'handleWarn',
      'kick': 'handleKick',
      'ban': 'handleBan'
    };

    this.override('handler', 'chat', 'processMessage');
  }

  registerCommand(name, handler, flags) {
    if(!this.commands)
      this.commands = {};
    if(!this.commands[name])
      this.commands[name] = [];

    if(typeof handler == 'string') {
      if(this[handler] && typeof this[handler] == 'function')
        handler = this[handler].bind(this);
    }

    if(!flags)
      flags = {};

    this.commands[name].push({
      func: handler,
      flags: flags
    });
  }

  unregister(name, func) {
    if(!name)
      return;

    var handlers = this.commands[name];

    if(!func)
      return this.commands[name] = [];

    if(handlers) {
      if(handlers.constructor !== Array) {
        handlers = [handlers];

        this.commands[name] = handlers;
      }

      for(var i in handlers) {
        const handler = handlers[i];
        const remove = () => {
          this.commands[name].splice(i, 1);
        };

        switch(typeof handler) {
          case 'function':
            if(handler === func)
              return remove();
          break;
          case 'object':
            if(handler.func === func)
              return remove();
        }
      }
    }
  }

  processMessage(data, client) {
    var msg = data.message;

    if(msg) {
      msg = utils.replaceUnicode(msg);

      if(filter.isProfane(msg) && client.rank < 2) {
        msg = filter.clean(msg);

        client.alert(
          '<b>Warning</b>' +
          '<br><br>Bad language is strictly forbidden. Help us keep this a safe and friendly environment for children rather than a toxic one.',
        'moderator');
      }

      if(msg.substr(0, this.prefix.length) == this.prefix)
        return this.process(msg, client);

      client.say(msg);
    }
  }

  process(message, client) {
    var params = message.substr(this.prefix.length).split(' ');

    const command = params.shift();
    const next = () => {
      client.say(message);
    };

    params = params.map(param => param.split('[_]').join(' '));

    if(command) {
      var handlers = this.commands[command];

      if(handlers) {
        if(handlers.constructor !== Array)
          handlers = [handlers];

        const override = handlers.find(handler => handler.flags && handler.flags.override == true);

        if(override)
          handlers = [override];

        for(var i in handlers) {
          var func = handlers[i];

          if(typeof func == 'object')
            func = func.func;

          if(typeof func == 'string') {
            if(this[func] && typeof this[func] == 'function')
              func = this[func].bind(this);
          }

          if(typeof func == 'function')
            func(params, client, next, message);
        }
      }
    }
  }

  handleGiveGold(data, client, next) {
    if(client.rank >= 3) {
      const user = data[0];
      const amt  = Number(data[1]);

      if(user && amt && amt > 0) {
        const sclient = this.server.getClient(user);

        if(sclient) {
          sclient.addGold(amt);
          client.notify('Added ' + utils.formatNumber(amt) + ' gold to ' + sclient.username + '.');
        } else {
          this.database.addGold(user, amt).then(res => {
            if(res > 0)
              client.notify('Added ' + utils.formatNumber(amt) + ' gold to offline ' + user + '.');
            else
              client.notify('User ' + user + ' was not found.');
          });
        }
      }
    }
  }

  handleGiveTitle(data, client) {
    if(client.rank >= 3) {
      const user = data.shift();
      const title = data.join(' ');

      if(user && title) {
        const sclient = this.server.getClient(user);

        if(sclient) {
          sclient.update('subtitle', title);
          sclient.updatePlayer();

          client.notify('Changed ' + sclient.username + '\'s title to ' + title + '.');
        } else {
          this.database.updateColumn(user, 'Subtitle', title).then(res => {
            if(res > 0)
              client.notify('Changed offline ' + user + '\'s title to ' + title + '.');
            else
              client.alert('User ' + user + ' was not found.');
          });
        }
      }
    }
  }

  handleGiveColor(data, client) {
    if(client.rank >= 3) {
      const user = data.shift();
      var   color = data.shift();
      const strColor = String(color).toLowerCase();

      const colorMap = {
        red: '#FF0000'
      };
      // TODO: Complete the color map

      if(colorMap[strColor])
        color = colorMap[strColor];

      if(user && color) {
        if(!String(color).toLowerCase().startsWith('0x'))
          color = '0x' + color;
        if(color.length != 8)
          return client.alert('Invalid color.', 'warning');

        color = color.toUpperCase();
        const sclient = this.server.getClient(user);

        if(sclient) {
          sclient.update('color', color);
          sclient.updatePlayer();

          client.notify('Changed ' + sclient.username + '\'s namecolor to ' + color + '.');
        } else {
          this.database.updateColumn(user, 'Color', color).then(res => {
            if(res > 0)
              client.notify('Changed offline ' + user + '\'s namecolor to ' + color + '.');
            else
              client.alert('User ' + user + ' was not found.');
          });
        }
      }
    }
  }

  handleJoinRoom(data, client) {
    const room = data.shift();

    client.joinRoom(room);
  }

  handleRejoin(data, client) {
    client.joinRoom(client.room);
  }

  handleRevive(data, client) {
    if(client.rank > 2) {
      const user = data.join(' ');

      this.database.updateColumn(user, 'Dead', 0).then(res => {
        if(res > 0)
          client.alert('Revived ' + user + ' successfully.');
        else
          client.alert('User ' + user + ' was not found.');
      }).catch(err => {
        this.logger.error(err);

        client.alert('An error occured. Please contact a server administrator.', 'warning');
      });
    }
  }

  handleAddMaterial(data, client) {
    if(client.rank > 2) {
      const mats = ['silver', 'iron', 'gold'];

      const user = data.shift();
      var   mat = data.shift();
      const amt = Number(data[0]) || 1;

      if(!user || !mat)
        return client.alert('Not enough parameters.', 'warning');

      mat = mat.toLowerCase();

      if(!mats.includes(mat))
        return client.alert('Invalid material: ' + mat + '.');

      const sclient = this.server.getClient(user);

      if(sclient) {
        sclient.addMaterial(mat, amt);

        client.alert('Added ' + amt + ' ' + mat + ' to ' + sclient.username + '.');
      } else {
        const fail = err => {
          this.logger.error(err);

          client.alert('An error occured. Please contact a server administrator.', 'warning');
        };

        this.database.getColumns(user, 'Username', 'Materials').then(Player => {
          if(Player) {
            Player.Materials = utils.parse(Player.Materials, {});

            for(var i in Player.Materials) {
              Player.Materials[i] = Number(Player.Materials[i]) || 0;
            }

            if(!Player.Materials[id])
              Player.Materials[id] = 0;

            Player.Materials[id] += amt;

            this.updateColumn(user, 'Materials', JSON.stringify(Player.Materials)).then(res => {
              if(res > 0)
                client.alert('Added ' + amt + ' ' + mat + ' to offline ' + Player.Username);
              else
                client.alert('This is embarrassing.. It didn\'t go through. Please try again.');
            }).catch(fail);
          } else
            client.alert('User ' + user + ' was not found.');
        }).catch(fail);
      }
    }
  }

  handleWarn(data, client) {
    const user = data.shift();
    const reason = data.join(' ');

    this.moderation.punish('warn', { user, reason }, client);
  }

  handleKick(data, client) {
    const user = data.shift();
    const reason = data.join(' ');

    this.moderation.punish('kick', { user, reason }, client);
  }

  handleBan(data, client) {
    const user = data.shift();
    var length = 999;

    if(data[0]) {
      if(isNaN(data[0])) {
        const arr = data[0].toLowerCase().split('h');

        if(arr.length == 2 && !isNaN(arr[0])) {
          data.shift();

          length = Number(arr[0]);
        }
      } else
        length = data.shift();
    }

    const reason = data.join(' ');

    this.moderation.punish('ban', { user, reason, length }, client);
  }
}

module.exports = Commands;
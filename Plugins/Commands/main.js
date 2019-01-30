'use strict';

const Plugin = require('../Plugin');

const utils  = require('../../Snaildom/Utils/Utils');
const filter = require('../../Snaildom/Utils/Filter');

class Commands extends Plugin {
  constructor(manager) {
    super('commands', __dirname, manager);

    this.commands = {
      'gg': 'handleGiveGold',
      'gt': 'handleGiveTitle',
      'gc': 'handleGiveColor'
    };
    this.prefix = this.get('prefix') || '/';

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
}

module.exports = Commands;
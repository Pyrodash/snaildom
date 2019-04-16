'use strict';

const Plugin = require('../Plugin');

class Logger extends Plugin {
  constructor(manager) {
    super('logger', __dirname, manager);

    this.depend('handler', 'moderation', 'h.onModerationLoaded');
  }

  onModerationLoaded(moderation) {
    if(this.moderation)
      this.removeEvents(this.moderation);

    this.addEvent(moderation, 'punished', data => {
      const {type, issuer, user, reason} = data;

      this.log(type, issuer, user, reason);
    });
  }

  write(message, level) {
    if(message.action) {
      if(message.information)
        this.save(message);

      if(message.message) {
        const bot = this.plugins.find('discord');

        if(bot) {
          if(!level || !bot.LEVELS[level])
            level = 'DEFAULT';

          const msg = {};
          const allowed = ['action', 'message', 'thumbnail', 'image'];

          for(var i in allowed) {
            const key = allowed[i];

            if(message[key])
              msg[key] = message[key];
          }

          bot.log(msg, level);
        }
      }
    }
  }

  async log(action) {
    const args = Array.from(arguments).slice(1);

    var User1 = args.shift();
    var User2 = args.shift();
    var reason = args[0];

    if(!User1 || !User2)
      return;

    var IP1;
    var IP2;

    if(User1.build) {
      IP1 = User1.ip;
      User1 = User1.build(false, true);
      User1.IP = IP1;
    }

    if(User2.build) {
      IP2 = User2.ip;
      User2 = User2.build(false, true);
      User2.IP = IP2;
    }

    if(typeof User1 != 'object')
      User1 = await this.fetchPlayer(User1);
    if(typeof User2 != 'object')
      User2 = await this.fetchPlayer(User2);

    if(!User1.ID || !User2.ID)
      return;

    const log = {};

    var information = User1.ID + ':' + User1.Username + ':' + User1.IP + ' | ';
    var message;

    switch(action) {
      case 'warn':
        information += 'WARNED: "' + User2.Username + '"';
        message = User1.Username + ' has warned ' + User2.Username;
      break;
      case 'kick':
        information += 'KICKED: "' + User2.Username + '"';
        message = User1.Username + ' has kicked ' + User2.Username;
      break;
      case 'ban':
      case 'ipban':
      case 'ban-offline':
      case 'ipban-offline':
        const prefix = action.startsWith('ip') ? 'ip' : '';

        information += prefix.toUpperCase() + 'BANNED: "' + User2.Username + '"';
        message = User1.Username + ' has ' + prefix + 'banned ' + User2.Username;
      break;
      case 'unban':
        information += 'UNBANNED: "' + User2.Username + '"';
        message = User1.Username + ' has unbanned ' + User2.Username;
    }

    if(reason) {
      information += ' | REASON: "' + reason + '"';
      message += ' for the reason: ' + reason + '.';
    } else
      message += '.';

    log['information'] = information;
    log['message'] = message;
    log['action'] = action;
    
    this.write(log);
  }

  fetchPlayer(player) {
    return this.database.getColumns(player, 'ID', 'Username', 'IP');
  }

  save(message) {
    const msg = {
      Action: message.action,
      Information: message.information
    };

    if(message.time)
      msg['Date'] = message.time.toISOString();

    this.database.knex('logs').insert(msg).catch(this.logger.error);
  }
}

module.exports = Logger;
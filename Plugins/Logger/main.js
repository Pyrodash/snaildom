'use strict';

const logger = require('../../Snaildom/Utils/Logger');
const Plugin = require('../Plugin');

class Logger extends Plugin {
  constructor(manager) {
    super('logger', __dirname, manager);
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

  log(action) {
    const args = Array.from(arguments).slice(1);

    var User1 = args.shift();
    var User2 = args.shift();
    var reason = args[0];

    if(!User1 || !User2)
      return;

    if(User1.build)
      User1 = User1.build(false, true);
    if(User2.build)
      User2 = User2.build(false, true);

    const log = {};

    var information = User1.ID + ':' + User1.Username + ':' + User1.IP + ' |';
    var message;

    switch(action) {
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

  save(message) {
    const msg = {
      Action: message.action,
      Information: message.information
    };

    if(message.time)
      msg['Date'] = message.time.toISOString();

    this.database.knex('logs').insert(msg).catch(logger.error);
  }
}

module.exports = Logger;
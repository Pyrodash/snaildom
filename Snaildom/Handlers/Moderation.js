'use strict';

const Handler = require('../Handler');
const utils   = require('../Utils/Utils');

class Moderation extends Handler {
  constructor(world) {
    super(world);

    this.register('warning', 'handleWarning');
    this.register('kick', 'handleKick');
    this.register('ban', 'handleBan');
  }

  handleWarning(data, client) {
    this.punish('warn', { user: data.id, reason: data.warning }, client);
  }

  handleKick(data, client) {
    this.punish('kick', { user: data.id, reason: data.reason }, client);
  }

  handleBan(data, client) {
    this.punish('ban', { user: data.id, reason: data.reason, length: data.duration }, client);
  }

  punish(type, data, client) {
    var offlineHandler = null;

    if(!type || !data || !client)
      return this.logger.warn('Not enough arguments to punish player.');

    var pastType;
    var typeFunc = type;

    const args = [];
    const {user, reason} = data;

    args.push(reason || null);

    switch(type) {
      case 'warning':
        type = 'warn';

        return this.punish(...Array.from(arguments));
      break;
      case 'warn':
        pastType = 'warned';
      break;
      case 'kick':
        pastType = 'kicked';
      break;
      case 'ban':
        pastType = 'banned';
        offlineHandler = this.offlineBan.bind(this);

        if(data.length == 0)
          data.length = 999;

        args.push(client.id);
        args.push(data.length || 1);
      break;
      default:
        return this.logger.warn('Invalid punishment type: ' + type + '.');
    }

    const onPunished = player => {
      if(!player)
        player = user;

      const username = player.username || player;

      client.notify(utils.ucfirst(pastType) + ' user ' + username + ' successfully.');
      this.emit('punished', { issuer: client, user: player, type, reason })
    };

    if(client.rank >= 2) {
      if(!user)
        return client.alert('Please enter a valid user.');

      const sclient = this.server.getClient(user);

      if(sclient) {
        if(sclient.rank < client.rank) {
          sclient[typeFunc](...args);
          onPunished(sclient);
        } else {
          client.alert('You cannot ' + type + ' someone who is greater than or equal to you in power.');
          sclient.alert(client.username + ' has tried to ' + type + ' you.');
        }
      } else {
        if(!offlineHandler)
          return client.alert(user + ' is offline.');

        offlineHandler(user, ...args).then(res => {
          if(res)
            onPunished();
          else
            client.alert('User ' + user + ' was not found.');
        }).catch(err => {
          this.logger.error(err);

          client.alert('An error occured. Please contact a server administrator.');
        });
      }
    } else
      this.logger.warn(client.getTag() + ' tried to warn user ' + user || 'undefined' + ' without being staff.');
  }

  offlineBan(user, reason, issuer, length) {
    return new Promise((resolve, reject) => {
      if(typeof user == 'string')
        return this.database.getColumns(user, 'ID').then(User => {
          if(User)
            this.offlineBan(User.ID, reason).then(resolve).catch(reject);
          else
            resolve();
        }).catch(reject);

      this.database.getBan(user).then(Ban => {
        if(Ban)
          resolve(true);
        else
          this.database.addBan({User: user, Reason: reason, Issuer: issuer, Length: length}).then(resolve).catch(reject);
      }).catch(reject);
    });
  }
}

module.exports = Moderation;
'use strict';

const utils       = require('../../Snaildom/Utils/Utils');

const Plugin      = require('../Plugin');
const DiscordJS   = require('discord.js');

const {Client}    = DiscordJS;
const {RichEmbed} = DiscordJS;

// Yes I know you can use {item, item} = module but then I'd have to add too much space to align the = signs under each other and it'd look ugly. Fuck that.

class Discord extends Plugin {
  constructor(manager) {
    super('discord', __dirname, manager);

    this.LEVELS = {
      DEFAULT: {
        color: '#0099FF',
        channel: '567105261328662537'
      }
    };

    this.start();
  }

  start() {
    this.client = new Client;

    this.addEvent(this.client, 'ready', () => {
      this.logger.write('Discord is ready.');
    });

    this.addEvent(this.client, 'error', err => {
      this.logger.error(err);
    });

    this.client.login(this.get('token'));
  }

  log(msg, level) {
    if(!msg || !msg.action || !msg.message)
      return;
    if(!level || !this.LEVELS[level])
      level = 'DEFAULT';
    if(!msg.time)
      msg.time = new Date();

    level = this.LEVELS[level];
    msg.action = msg.action.split('-').map(word => utils.ucfirst(word)).join(' ');

    const embed = new RichEmbed()
      .setColor(level.color)
      .setTitle(msg.action)
      .setDescription(msg.message)
      //.setFooter('World world name here')
      .setTimestamp(msg.time);

    if(msg.thumbnail)
      embed.setThumbnail(msg.thumbnail);

    const channel = this.client.channels.get(level.channel);

    if(channel)
      channel.send(embed);
  }

  destroy() {
    this.client.destroy();
    super.destroy();
  }
}

module.exports = Discord;
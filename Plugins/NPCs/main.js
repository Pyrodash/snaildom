'use strict';

const utils   = require('../../Snaildom/Utils/Utils');
const reload  = require('require-reload');

const Plugin  = require('../Plugin');
const Client  = require('../../Snaildom/Client');

const NPCList = reload('./NPCs');
const Topics  = reload('./Topics');

class NPCs extends Plugin {
  constructor(manager) {
    super('npcs', __dirname, manager);

    this.populate();

    this.register('handler', 'talk', 'handleTalk');
    this.register('handler', 'response', 'handleResponse');
  }

  populate() {
    if(!this.npcs)
      this.npcs = [];

    for(var i in NPCList) {
      const Player = NPCList[i];
      const NPC = new Client(null, this.server, true);

      NPC.authenticated = true;
      NPC.dialogue = Player.Dialogue;

      NPC.setPlayer(Player);
      NPC.joinRoom(Player.Room, Player.X, Player.Y, Player.Frame);

      this.npcs.push(NPC);
    }
  }

  handleTalk(data, client) {
    const {id} = data;
    const NPC = this.npcs.find(npc => npc.id == id);

    if(NPC && NPC.room == client.room) {
      if(NPC.dialogue)
        client.send('talk', {
          player: NPC.build(),
          dialogue: NPC.dialogue
        });
    }
  }

  handleResponse(data, client) {
    const topicID = data.topic;
    const topic = Topics.find(t => t.id == topicID);

    if(topic) {
      const topicObj = Object.assign({}, topic);
      const NPC = this.npcs.find(npc => npc.id == topic.npc);

      topicObj.message = utils.format(topicObj.message, {my: client});

      if(NPC && NPC.room == client.room)
        client.send('response', {
          player: NPC.build(),
          dialogue: topicObj
        });
    }
  }

  destroy() {
    super.destroy();

    for(var i in this.npcs) {
      this.npcs[i].disconnect();
    }
  }
}

module.exports = NPCs;

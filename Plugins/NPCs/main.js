'use strict';

const reload  = require('require-reload');
const utils   = reload('./utils');

const Plugin  = require('../Plugin');

const NPCList = reload('./NPCs');
const Topics  = reload('./Topics');

const NPC     = reload('./NPC');
const AI      = reload('./AI');

const topics  = utils.parseTopics(Topics);
const npcs    = utils.parseNPCs(NPCList);

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

    for(var i in npcs) {
      const Player = npcs[i];
      const NPCClass = Player.AI ? AI : NPC;
      const npc = new NPCClass(Player, this.server);

      this.npcs.push(npc);
    }
  }

  handleTalk(data, client) {
    const {id} = data;
    const npc = this.npcs.find(npc => npc.id == id);

    if(npc && npc.room == client.room) {
      if(npc.dialogue && Object.keys(npc.dialogue).length > 0)
        client.send('talk', {
          player: npc.build(),
          dialogue: npc.dialogue
        });
    }
  }

  handleResponse(data, client) {
    const topicID = data.topic;
    const topic = topics.find(t => t.id == topicID);
    
    if(topic) {
      const topicObj = Object.assign({}, topic);
      const npc = this.npcs.find(npc => npc.id == topic.npc);

      topicObj.message = utils.format(topicObj.message, {my: client});

      if(npc && npc.room == client.room) {
        client.send('response', {
          player: npc.build(),
          dialogue: topicObj
        });

        if(topicObj.item) {
          const handlers = this.handlers.find('buy');

          for(var handler of handlers) {
            handler({id: topicObj.item}, client);
          }
        }
      }
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

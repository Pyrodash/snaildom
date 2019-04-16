'use strict';

const Handler = require('../Handler');

class Quest extends Handler {
  constructor(world) {
    super(world);

    this.register('questupdate', 'handleQuestUpdate');
  }

  handleQuestUpdate(data, client) {
    const {id, stage} = data;

    if(client.hasQuest(id) && client.canSetStage(stage, id))
      client.setStage(stage, id);
  }
}

module.exports = Quest;
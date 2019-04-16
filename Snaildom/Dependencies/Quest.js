'use strict';

const Dependency = require('../Dependency');

class Quest extends Dependency {
  addQuest(id, stage, priority, update) {
    if(update != false)
      update = true;

    if(typeof stage == 'boolean' && !priority && !update) {
      update = stage;
      stage = null;
    }

    if(!stage)
      stage = 1;
    if(!id)
      return this.logger.warn('No quest ID provided to add quest.');
    if(!priority || isNaN(priority) || (priority < 0 || priority > 1))
      priority = 0;

    this.quests.push({id, stage, priority});

    if(update)
      this.updateQuests();

    this.send('questadd', {id, stage, priority});
  }

  removeQuest(id, update) {
    if(update != false)
      update = true;
    if(!id)
      return this.logger.warn('No quest ID provided when trying to remove quest.');

    var found = false;

    for(var i in this.quests) {
      const quest = this.quests[i];

      if(quest.id == id) {
        found = true;
        this.quests.splice(i, 1);

        break;
      }
    }

    if(update && found)
      this.updateQuests();
  }

  hasQuest(id) {
    return id == 1 ? true : Boolean(this.getQuest(id));
  }

  getQuest(id) {
    return this.quests.find(quest => quest.id == id);
  }

  setStage(stage, id, update) {
    if(update != false)
      update = true;

    // If quest is tutorial
    if(id == 1) {
      update = false;

      if(!this.tutorial) {
        this.send('questupdate', {id, stage, priority: 0});

        // Finish tutorial
        if(stage == 8) {
         this.update('tutorial', 1);
         this.notify('You have successfully completed the tutorial. You have been awarded with 100 gold to begin your adventure.'); //TODO: Edit client to add break line for lines too long like this one

         this.addGold(100);
         this.removeQuest(1, false);
       }
     } else
      return;
    }

    if(!this.hasQuest(id))
      return;

    for(var i in this.quests) {
      const quest = this.quests[i];

      if(quest.id == id) {
        this.quests[i]['stage'] = Number(stage);

        if(update)
          this.updateQuests();
      }
    }

    this.send('questupdate', this.getQuest(id));
  }

  canSetStage(stage, quest) {
    if(!this.hasQuest(quest))
      return false;

    // TODO: Add a stage completion check.

    return true;
  }

  updateQuests() {
    this.updateColumn('Quests',
      this.quests.map(quest => [quest.id, quest.stage, quest.priority].join(':'))
      .join(',')
    );
  }
}

module.exports = Quest;
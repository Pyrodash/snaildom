'use strict';

const Plugin = require('../Plugin');

class DamenBall extends Plugin {
  constructor(manager) {
    super('damenball', __dirname, manager);
    this.footballSpawn = {
      x: 380,
      y: 222
    };

    this.setup();

    this.register('handler', 'ballpos', 'handleBallHit');
    this.register('handler', 'goal', 'handleGoal');

    this.register('command', 'startmatch', 'handleStartMatch');
    this.register('command', 'endmatch', 'handleEndMatch');
  }

  setup() {
    this.room = this.roomManager.find('damenball');
    this.setBallPos(this.footballSpawn, null, null, false);

    if(this.room) {
      this.room.customBuild = {
        footballx: () => this.football.x,
        footbally: () => this.football.y,
        match: () => this.getMatch()
      };
    } else
      this.logger.warn('DamenBall room not found.');
  }

  getMatch() {
    if(this.match) {
      const now = Math.round(new Date().getTime() / 1000);
      const seconds = now - (Math.round(this.match.start / 1000));

      return {
        name: this.match.name,
        score1: this.match.score[0],
        score2: this.match.score[1],
        seconds: seconds
      };
    } else
      return null;
  }

  startMatch(name, length) {
    if(!length)
      length = 5 * 1000 * 60; // 5 mins

    this.match = {
      name: name || 'Casual Match',
      score: [0, 0],
      start: new Date().getTime()
    };

    this.resetBall();
    this.room.send('matchstart', {match: this.getMatch()});

    this.timer = setTimeout(() => {
      this.endMatch();
    }, length);
  }

  endMatch() {
    if(this.timer) {
      clearTimeout(this.timer);

      this.timer = null;
    }

    this.room.send('matchend');
    this.resetBall();

    //this.timer = setTimeout(() => this.startMatch.bind(this));
    //Dunno if I should enable the loop.
  }

  setBallPos(x, y, id, send, set) {
    if(typeof x == 'object')
      return this.setBallPos(x.x, x.y, x.id, send, set)
    if(!id)
      id = null;

    if(!this.football)
      this.football = {};

    this.football.x = x;
    this.football.y = y;

    if(send !== false) {
      if(set !== true)
        this.room.send('ballpos', {
          x: x,
          y: y,
          id: id
        });
      else
        this.room.send('ballset', {
          x: x,
          y: y
        });
    }
  }

  resetBall() {
    this.setBallPos(this.footballSpawn, null, null, true, true);
  }

  handleBallHit(data, client) {
    const {x, y} = data;

    if(client.room.id == 'damenball' && !isNaN(x) && !isNaN(y))
      this.setBallPos(x, y, client.id);
  }

  handleGoal(data, client) {
    var {goal} = data;

    if(goal && !isNaN(goal)) {
      goal--;

      if(goal < 0 || goal > 1)
        return;
      if(!this.match)
        return;

      this.match.score[goal]++;

      this.setBallPos(this.footballSpawn, null, null, false);
      this.room.send('ballset', {
        x: this.football.x,
        y: this.football.y,
        score: ++goal
      });
    }
  }

  handleStartMatch(data, client) {
    const name = data.join(' ');

    if(client.rank > 2)
      this.startMatch(name);
  }

  handleEndMatch(data, client) {
    if(client.rank > 2 && this.match)
      this.endMatch();
  }

  destroy() {
    super.destroy();

    clearTimeout(this.timer);
  }
}

module.exports = DamenBall;
'use strict';

const Dependency = require('../Dependency');

class Gold extends Dependency {
  addGold(amt, notify) {
    if(notify != false)
      notify = true;

    this.update('gold', this.gold + amt);
    this.send('gold-add', {
      amount: amt,
      total: this.gold,
      notify: notify
    });
  }

  removeGold(amt, notify) {
    if(notify != false)
      notify = true;

    this.update('gold', this.gold - amt);
    this.send('gold-remove', {
      amount: amt,
      total: this.gold,
      notify: notify
    });
  }
}

module.exports = Gold;
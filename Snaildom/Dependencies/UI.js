'use strict';

const Dependency = require('../Dependency');

class UI extends Dependency {
  alert(msg, type) {
    const headers = ['info', 'warning', 'error', 'moderator'];

    if(!type || !headers.includes(type.toLowerCase()))
      type = 'info';

    this.send('custom-message', {
      type: type,
      message: msg
    });
  }

  notify(msg, type) {
    this.send('notice', {
      message: msg,
      type
    });
  }
}

module.exports = UI;
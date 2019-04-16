'use strict';

const Room   = require('./Room');
const utils  = require('./Utils/Utils');

class Shell extends Room {
  constructor(crumbs, world) {
    super(crumbs, world);
  }

  apply(crumbs) {
    this.furniture = utils.parseFurniture(crumbs.furniture);
    this.shell = {
      id: crumbs.type,
      playerId: crumbs.owner.id
    };
    crumbs = {
      id: 'shell_' + crumbs.owner.id,
      name: crumbs.owner.username + '\'s Shell',
      owner: crumbs.owner,
      isShell: 1
    };

    super.apply(crumbs);
  }

  build() {
    const build = super.build();

    build.shell = this.shell;
    build.shell.furniture = this.furniture;

    return build;
  }

  updateColumn(col, val) {
    return this.database.knex('shells').update(col, val).where('Owner', this.owner.id).catch(this.logger.error);
  }
}

module.exports = Shell;
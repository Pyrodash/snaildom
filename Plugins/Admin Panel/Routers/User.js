'use strict';

const logger = require('../../../Snaildom/Utils/Logger');
const utils  = require('../utils');

const Router = require('./Router');

class User extends Router {
  constructor(panel) {
    super('/user', panel);

    this.use('sessionOnly');

    this.register('GET', '/edit/:id', 'render');
    this.register('POST', '/edit/:id', 'save');
  }

  render(req, res) {
    const {id} = req.params;

    if(!id)
      return res.end();

    this.database.getPlayer(id).then(player => {
      if(!player) {
        res.status(404);

        return res.end('User not found.');
      }

      res.render(this.view('user'), {Player: player, title: 'Editing ' + player.Username});
    });
  }

  async save(req, res) {
    const {id} = req.params;

    if(!id)
      return res.end();

    const User = req.body;

    if(User.Password) {
      if(!utils.validHash(User.Password))
        User.Password = await utils.hash(User.Password);
    }

    for(var i in User) {
      const Prop = User[i];

      if(!Prop)
        User[i] = null;
    }

    this.knex('users').update(User).where('ID', id).then(resp => {
      res.redirect('back');
    }).catch(err => this.error(err, req, res));
  }

  error(err, req, res) {
    logger.error(err);

    res.status(500);
    res.end();
  }
}

module.exports = User;
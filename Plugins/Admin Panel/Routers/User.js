'use strict';

const utils  = require('../utils');
const Router = require('./Router');

class User extends Router {
  constructor(panel) {
    super('/user', panel);

    this.use('sessionOnly');

    this.register('GET', '/edit/:id', 'render');
    this.register('POST', '/edit/:id', 'save');

    this.register('GET', '/insert', 'viewInsert');
    this.register('POST', '/insert', 'insert');
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
    }).catch(err => this.error(err, req, res));
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

    if(User.ID)
      delete User.ID;

    for(var i in User) {
      const Prop = User[i];

      if(!Prop)
        User[i] = null;
    }

    this.knex('users').update(User).where('ID', id).then(resp => {
      res.redirect('back');
    }).catch(err => this.error(err, req, res));
  }

  viewInsert(req, res) {
    res.render(this.view('user'), {
      insertMode: true,
      Player: {
        Gold: 0,
        Level: 1,
        Exp: 0,
        Dead: 0,
        Rank: 1,
        Royal: 0,
        Famous: 0,
        Knight:	0,
        Ghost: 0,
        IceGhost: 0,
        Health: 100
      }
    });
  }

  async insert(req, res) {
    const User = req.body;

    if(User.ID)
      delete User.ID;
    if(!User.Username)
      return res.end('Please provide a username.');

    if(User.Password) {
      if(!utils.validHash(User.Password))
        User.Password = await utils.hash(User.Password);
    }

    this.knex('users').first('ID').where('Username', User.Username).then(Existing => {
      if(Existing)
        return res.end('A user with the same username already exists. Rename their account before making an account with the same name.');

      this.knex('users').insert(User).then(resp => {
        res.redirect('/users');
      }).catch(err => this.error(err, req, res));
    }).catch(err => this.error(err, req, res));
  }
}

module.exports = User;
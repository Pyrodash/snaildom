'use strict';

const Router = require('./Router');

class Ban extends Router {
  constructor(panel) {
    super('/ban', panel);

    this.use('sessionOnly');

    this.register('GET', '/edit/:id', 'render');
    this.register('POST', '/edit/:id', 'save');

    this.register('GET', '/insert', 'viewInsert');
    this.register('POST', '/insert', 'insert');

    this.register('GET', '/remove/:id', 'remove');

    this.cache = {};
  }

  render(req, res) {
    const {id} = req.params;

    if(!id)
      return res.end();

    this.database.getBan({ID: id}).then(ban => {
      if(!ban) {
        res.status(404);

        return res.end('Ban not found.');
      }

      this.cache[ban.ID] = ban;
      res.render(this.view('ban'), {Ban: ban, title: 'Editing ban ' + ban.ID});
    });
  }

  save(req, res) {
    const {id} = req.params;

    if(!id)
      return res.end();

    const Ban = req.body;

    if(Ban['ID'])
      delete Ban['ID'];
    if(Ban['Date'])
      delete Ban['Date'];

    const save = () => {
      this.knex('bans').update(Ban).where('ID', id).then(resp => {
        res.redirect('back');
      }).catch(err => this.error(err, req, res));
    };

    if(!user || !issuer)
      return res.end();

    const Cached = this.cache[id];

    if(Cached && Cached.User == user && Cached.Issuer == issuer)
      return save();

    this.validate(Ban, req, res).then(resp => {
      if(resp) {
        if(Cached && Cached.User != user)
          this.logger.log('ban', res.locals.Self, resp[0]);

        this.database.updateColumn(resp[0].ID, 'Rank', 1);

        save();
      }
    }).catch(err => this.error(err, req, res));
  }

  viewInsert(req, res) {
    res.render(this.view('ban'), {
      insertMode: 1,
      Ban: {}
    });
  }

  insert(req, res) {
    const Ban = req.body;

    if(Ban.ID)
      delete Ban.ID;
    if(Ban.Date)
      delete Ban.Date;
    if(!Ban.Length)
      Ban.Length = 999;
    if(!Ban.Issuer)
      Ban.Issuer = req.session.id;
    if(!Ban.User)
      return res.end('Please enter a user.');

    Ban.Active = 1;

    this.validate(Ban, req, res).then(resp => {
      if(resp) {
        this.database.updateColumn(resp[0].ID, 'Rank', 1);

        this.knex('bans').insert(Ban).then(() => {
          this.logger.log('ban', res.locals.Self, resp[0]);

          res.redirect('/bans');
        }).catch(err => this.error(err, req, res));
      }
    }).catch(err => this.error(err, req, res));
  }

  remove(req, res) {
    const {id} = req.params;
    const log = Ban => {
      if(!Ban) {
        const Cache = this.cache[id];

        if(Cache && Cache.User)
          Ban = Cache;
        else
          return this.knex('bans').first('User').where('ID', id).then(Ban => { if(Ban) log(Ban) }).catch(err => this.error(err));
      }

      this.knex('users').first('Username').where('ID', Ban.User).then(User => {
        this.logger.log('unban', res.locals.Self, User);
      }).catch(err => this.error(err));
    };

    if(!id)
      return res.end();

    this.knex('bans').update('Active', 0).where('ID', id).then(resp => {
      res.redirect('/bans');
      log();
    }).catch(err => this.error(err, req, res));
  }

  validate(Ban, req, res) {
    return new Promise((resolve, reject) => {
      const user = Ban.User;
      const issuer = Ban.Issuer;

      const type1 = isNaN(user) ? 'Username' : 'ID';
      const type2 = isNaN(issuer) ? 'Username' : 'ID';

      if(user == req.session.id) {
        res.end('Self harm is bad :(');

        return resolve(false);
      }

      this.knex('users').first('ID', 'Username', 'Rank').where(type1, user).then(User => {
        if(!User) {
          res.status(404);
          res.end('User ' + user + ' was not found.');

          return resolve(false);
        }

        if(User.ID == req.session.id) {
          res.end('Self harm is bad :(');

          return resolve(false);
        }

        if(res.locals.Self && res.locals.Self.Rank <= User.Rank) {
          res.end('You cannot ban someone who is higher or equal to you in power.');

          return resolve(false);
        }

        this.knex('users').first('ID').where(type2, issuer).then(Issuer => {
          if(!Issuer) {
            res.status(404);
            res.end('User ' + user + ' was not found.');

            return resolve(false);
          }

          Ban['User'] = User.ID;
          Ban['Issuer'] = Issuer.ID;

          resolve([User, Issuer]);
        }).catch(reject);
      }).catch(reject);
    });
  }
}

module.exports = Ban;
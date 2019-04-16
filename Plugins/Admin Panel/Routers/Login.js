'use strict';

const Router = require('./Router');
const bcrypt = require('bcrypt-nodejs');

class Login extends Router {
  constructor(panel) {
    super(panel);

    this.register('GET', '/login', 'render', 'noSessionOnly');
    this.register('POST', '/login', 'process', 'noSessionOnly');

    this.register('GET', '/logout', 'logout');
  }

  render(req, res) {
    res.render(this.view('login'));
  }

  process(req, res) {
    const {username, password} = req.body;

    if(!username || !password)
      return res.send('2');

    this.database.getPlayer(username).then(Player => {
      if(!Player)
        return res.send('1');

      const pass = Player.Password.replace('$2y$', '$2a$');

      if(Player.Rank < 3)
        return res.send('1');

      bcrypt.compare(password, pass, (err, resp) => {
        if(resp === true) {
          req.session.id = Player.ID;

          res.send('0');
        } else {
          if(err)
            this.logger.error(err);

          res.send('1');
        }
      });
    });
  }

  logout(req, res) {
    this.destroySession(req);

    res.redirect('/');
  }
}

module.exports = Login;
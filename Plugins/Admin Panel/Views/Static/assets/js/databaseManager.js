class DatabaseManager {
  constructor(target) {
    this.root = '/query';
    this.target = target || null;

    this.limit = 50;
    this.offset = 0;
    this.order = 'desc';

    this.error = this.error.bind(this);
  }

  fetchUserList(filter) {
    this.lastAction = {
      func: 'fetchUserList',
      args: Array.from(arguments)
    };
    this.search = null;

    this.post(this.resolve('user-list'), {
      limit: this.limit,
      offset: this.offset,
      order: this.order
    }).then(users => {
      const next = data => {
        if(!data)
          data = users;

        this.render(data);
      };

      if(filter)
        filter(users, next.bind(this));
      else
        next();
    }).catch(this.error);
  }

  fetchUser(user, filter) {
    this.lastAction = {
      func: 'fetchUser',
      args: Array.from(arguments)
    };
    this.search = user;

    this.post(this.resolve('user'), {
      user: user
    }).then(user => {
      const next = data => {
        data = data ? data : user;

        this.render(data);
      };

      if(filter)
        filter(user, next.bind(this));
      else
        next();
    }).catch(this.error);
  }

  filterUser(users, next) {
    if(users.constructor != Array)
      users = [users];

    users = users.map(user => {
      user['Edit'] = '<a class="link" href="/user/edit/' + user.ID + '"><i class="fas fa-edit"></i></a>';

      return user;
    });

    next(users);
  }

  post(url, body) {
    return new Promise((resolve, reject) => {
      this.target.empty();
      showLoading();

      const opts = this.buildOpts(body);

      fetch(url, opts)
        .then(async res => {
          const body = await res.json();
          //this.offset += this.limit;

          hideLoading();
          resolve(body, res);
        }).catch(reject);
    });
  }

  resolve() {
    const args = Array.from(arguments).map(arg => {
      if(arg.charAt(0) == '/')
        arg = arg.substr(1);
      if(arg.charAt(arg.length - 1) == '/')
        arg = arg.slice(0, -1);

      return arg;
    }).join('/');

    return this.root + '/' + args;
  }

  render(data) {
    this.target.empty();

    if(!data)
      data = [];
    if(data.length == 0)
      data.push(['Your request yielded no results.']);

    for(var i in data) {
      const item = data[i];
      var el = '<tr>';

      for(var x in item) {
        el += '<td>' + item[x] + '</td>';
      }

      el += '</tr>';
      this.target.append(el);
    }
  }

  error(err) {
    console.warn(err);

    // TODO: Add a visual warning
  }

  refresh() {
    if(this.lastAction) {
      var func = this.lastAction.func;

      if(typeof func == 'string') {
        if(this[func] && typeof this[func] == 'function')
          func = this[func].bind(this);
      }

      if(typeof func == 'function')
        func(...this.lastAction.args);
    }
  }

  buildOpts(body) {
    if(!body)
      body = {};

    body = Object.keys(body).map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
    }).join('&');

    return {
      method : 'post',
      body   : body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
  }

  setTarget(target) {
    if(typeof target == 'string')
      target = $(target);

    this.target = target;
  }
}

window.dbManager = new DatabaseManager;
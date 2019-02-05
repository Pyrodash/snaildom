class DatabaseManager {
  constructor(target) {
    this.root = '/query';
    this.target = target || null;

    this.limit = 50;
    this.offset = 0;
    this.order = 'desc';

    this.error = this.error.bind(this);
    this.filter = this.filter.bind(this);
  }

  fetchList(where, filter) {
    this.lastAction = {
      func: 'fetchList',
      args: Array.from(arguments)
    };

    if(typeof where == 'function') {
      if(filter) {
        const f = where;

        where = filter;
        filter = f;
      } else {
        filter = where;
        where = null;
      }
    }

    if(where && typeof where != 'object') {
      if(isNaN(where))
        where = '%' + where + '%';

      switch(this.type) {
        case 'user':
          where = isNaN(where) ? [['Username', 'like', where]] : {ID: where};
        break;
        case 'ban':
          where = isNaN(where) ? [['U.Username', 'like', where], ['I.Username', 'like', where]] : {'B.ID': where};
        break;
        case 'log':
          where = [['Action', 'like', where], ['Information', 'like', where]]
      }
    }

    if(this.where && this.where == where)
      return;

    this.where = where;

    if(typeof where == 'object')
      where = JSON.stringify(where);

    this.post(this.resolve(this.type + '-list'), {
      limit: this.limit,
      offset: this.offset,
      order: this.order,
      where
    }).then(items => {
      const next = data => {
        if(!data)
          data = items;

        this.render(data);
      };

      if(filter)
        filter(items, next.bind(this));
      else
        next();
    }).catch(this.error);
  }

  filter(...args) {
    var func;

    switch(this.type) {
      case 'user':
        func = this.filterUser;
      break;
      case 'ban':
        func = this.filterBan;
      break;
      case 'log':
        func = this.filterLog;
    }

    return func(...args);
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

  filterBan(bans, next) {
    if(bans.constructor != Array)
      bans = [bans];

    bans = bans.map(ban => {
      ban['Edit'] = '<a class="link" href="/ban/edit/' + ban.ID + '">' +
                      '<i class="fas fa-edit"></i>' +
                    '</a>' +
                    '<a href="/ban/remove/' + ban.ID + '" class="removeBtn">' +
                      '<i class="far fa-trash-alt"></i>' +
                    '</a>';

      ban['Length'] = ban.Length == 999 ? 'Permanent' : ban.Length + 'h';
      ban['Date'] = new Date(ban['Date']).toDateString();

      delete ban.ID;
      return ban;
    });

    next(bans);
  }

  filterLog(logs, next) {
    if(logs.constructor != Array)
      logs = [logs];

    logs = logs.map(log => {
      log['Date'] = new Date(log['Date']).toUTCString();

      return log;
    });

    next(logs);
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

  setType(type) {
    this.type = type;
  }
}

window.dbManager = new DatabaseManager;
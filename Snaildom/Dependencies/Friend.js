'use strict';

const logger     = require('../Utils/Logger');

const Dependency = require('../Dependency');
const Promise    = require('bluebird');
const Client     = require('../Client');

class Friend extends Dependency {
  async refreshFriends() {
    this.send('dynamic-friend-list', {
      list: await this.getFriends(),
      list2: await this.getBlocked()
    });
  }

  getList(arr) {
    const list = [...arr].filter(item => item);

    return Promise.map(list, item => {
      return this.getListItem(item);
    }).filter(item => item);
  }

  getListItem(item) {
    return new Promise((resolve, reject) => {
      var client = this.server.getClient(item);

      if(client)
        return resolve(client.build());

      this.database.getPlayer(item).then(player => {
        if(!player)
          return resolve(false);

        client = new Client(null, this.server);

        client.setPlayer(player);
        client.destroy();

        resolve(client.build());
      }).catch(reject);
    });
  }

  getFriends() {
    return this.getList(this.friends);
  }

  getBlocked() {
    return this.getList(this.blocked);
  }

  isFriend(id) {
    if(typeof id == 'object') id = id.id;

    return this.friends.includes(Number(id));
  }

  isBlocked(id) {
    if(typeof id == 'object') id = id.id;

    return this.blocked.includes(id);
  }

  addRequest(type, client) {
    if(typeof type == 'object') {
      client = type;
      type = null;
    }

    if(!type || !['inbound', 'outbound'].includes(type))
      type = 'inbound';

    this.requests[type].push({
      date: new Date().getTime(),
      client: client
    });
  }

  canRequest(client) {
    const maxRequests = this.maxRequests || 1;

    if(client.isBlocked(this) || this.isBlocked(client))
      return false;
    if(this.isFriend(client) || client.isFriend(this))
      return false;

    client.filterRequests();

    return client.requestCount(this) < maxRequests;
  }

  filterRequests(type) {
    if(!type || !['inbound', 'outbound'].includes(type))
      type = 'inbound';

    this.requests[type] = this.requests[type].filter(request => {
      const now = new Date().getTime();
      const expiryTime = this.requestExpiryTime || 5 * 1000 * 60; // Default expiry time is 5 mins

      return (now - request.date) < expiryTime;
    });
  }

  requestCount(type, client) {
    if(typeof type == 'object') {
      client = type;
      type = null;
    }

    if(!type || !['inbound', 'outbound'].includes(type))
      type = 'inbound';

    return this.requests[type].filter(request => request.client == client).length;
  }

  addFriend(id) {
    if(!this.isFriend(id)) {
      this.friends.push(Number(id));

      this.updateColumn('Friends', this.friends.join(','));
      this.refreshFriends();
    }
  }

  removeFriend(id, send) {
    const i = this.friends.indexOf(Number(id));

    if(i > -1) {
      this.friends.splice(i, 1);

      this.updateColumn('Friends', this.friends.join(','));
      this.refreshFriends();
    }

    if(send === true)
      this.send('delete-friend', {id: id});
  }

  block(id) {
    if(!this.isBlocked(id)) {
      this.blocked.push(Number(id));

      this.updateColumn('Blocked', this.blocked.join(','));
      this.refreshFriends();
    }
  }

  unblock(id) {
    const i = this.blocked.indexOf(Number(id));

    if(i > -1) {
      this.blocked.splice(i, 1);

      this.updateColumn('Blocked', this.blocked.join(','));
      this.refreshFriends();
    }
  }
}

module.exports = Friend;
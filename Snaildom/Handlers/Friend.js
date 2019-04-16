'use strict';

const Handler = require('../Handler');

class Friend extends Handler {
  constructor(world) {
    super(world);

    this.register('friend-request', 'handleRequest');
    this.register('accept-request', 'handleAccept');
    this.register('unfriend', 'handleUnfriend');

    this.register('block', 'handleBlock');
    this.register('unblock', 'handleUnblock');

    this.register('find', 'handleFind');
  }

  handleRequest(data, client) {
    const {id} = data;

    if(id && !isNaN(id)) {
      if(!client.isFriend(id)) {
        const sclient = this.server.getClient(id);

        if(sclient && client.canRequest(sclient)) {
          sclient.addRequest('inbound', client);
          client.addRequest('outbound', sclient);

          sclient.send('friend-request', {
            id: client.id,
            name: client.username
          });
        }
      }
    }
  }

  handleAccept(data, client) {
    const {id} = data;

    if(data && !isNaN(id)) {
      const request = client.requests.inbound.filter(req => req.client.id == id);

      if(request && !client.isFriend(id) && !client.isBlocked(id)) {
        const sclient = this.server.getClient(id);

        client.addFriend(id);

        if(sclient && !sclient.isFriend(client.id)) {
          sclient.addFriend(client.id);

          client.send('accept-request', {
            id: sclient.id,
            name: sclient.username
          });
          return sclient.send('accept-request', {
            id: client.id,
            name: client.username
          });
        }

        this.database.getPlayer(id).then(Player => {
          if(Player) {
            const friends = Player.Friends.split(',').filter(f => f);

            if(!friends.includes(client.id)) {
              friends.push(client.id);

              this.database.updateColumn(Player.ID, 'Friends', friends.join(','));
            }

            client.send('accept-request', {
              id: Player.ID,
              name: Player.Username
            });
          }
        }).catch(this.logger.error);
      }
    }
  }

  handleUnfriend(data, client) {
    const {id} = data;

    if(id && !isNaN(id)) {
      if(client.isFriend(id)) {
        const sclient = this.server.getClient(id);

        client.removeFriend(id);

        if(sclient && sclient.isFriend(client.id)) {
          sclient.removeFriend(client.id, true);

          return;
        }

        this.database.getPlayer(id).then(Player => {
          const friends = Player.Friends.split(',').filter(f => f);
          const i = friends.indexOf(client.id);

          if(i > -1) {
            friends.splice(i, 1);

            this.database.updateColumn(Player.ID, 'Friends', friends.join(','));
          }
        });
      }
    }
  }

  handleBlock(data, client) {
    const {id} = data;

    if(id && !isNaN(id)) {
      if(!client.isBlocked(id)) {
        if(client.isFriend(id))
          client.removeFriend(id, true);

        client.block(id);

        const sclient = this.server.getClient(id);

        if(sclient) {
          if(sclient.isFriend(client))
            sclient.removeFriend(client.id, true);
        } else {
          this.database.getPlayer(id).then(player => {
            const friends = Player.Friends.split(',').filter(f => f);
            const i = friends.indexOf(client.id);

            if(i > -1) {
              friends.splice(i, 1);

              this.database.updateColumn(Player.ID, 'Friends', friends.join(','));
            }
          });
        }
      }
    }
  }

  handleUnblock(data, client) {
    const {id} = data;

    if(id && !isNaN(id)) {
      if(client.isBlocked(id))
        client.unblock(id);
    }
  }

  handleFind(data, client) {
    const {id, name} = data;

    if(id && !isNaN(id) && name && client.isFriend(id)) {
      const sclient = this.server.getClient(id);

      if(sclient && sclient.room && sclient.room.name)
        client.alert(sclient.username + ' is at ' + sclient.room.name + '.');
      else
        client.alert(name + ' was not found.');
    }
  }
}

module.exports = Friend;
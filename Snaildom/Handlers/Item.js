'use strict';

const Handler = require('../Handler');

const reload    = require('require-reload');
const utils     = reload('../Utils/Utils');

class Item extends Handler {
  constructor(world) {
    super(world);

    this.register('buy', 'handleBuy');
    this.register('buyfurniture', 'handleBuyFurniture');

    this.register('forge', 'handleForge');
    this.register('drop', 'handleDrop');

    this.register('read', 'handleRead');
  }

  handleBuy(data, client) {
    const {id} = data;

    if(id && this.crumbs.items[id]) {
      const item = this.crumbs.items[id];

      if(client.gold >= item.cost) {
        client.removeGold(item.cost);
        client.addItem(item.id);
      } else
        client.alert('You don\'t have enough gold.', 'warning');
    }
  }

  handleBuyFurniture(data, client) {
    const {id} = data;

    if(id && this.crumbs.furniture[id]) {
      const item = this.crumbs.furniture[id];

      if(client.gold >= item.cost) {
        client.removeGold(item.cost);
        client.addFurniture(item.id);
      } else
        client.alert('You don\'t have enough gold.', 'warning');
    }
  }

  handleForge(data, client) {
    const {id} = data;
    const item = this.crumbs.items[id];

    if(item && item.forge) {
      if(client.hasMaterials(item.forge)) {
        if(client.gold >= item.cost) {
          client.removeMaterials(item.forge);
          client.removeGold(item.cost);

          client.addItem(id);
        } else
          client.alert('You don\'t have enough gold to forge this item.', 'warning');
      } else
        client.alert('You don\'t have enough materials to forge this item.', 'warning');
    }
  }

  handleDrop(data, client) {
    const {id} = data;

    client.removeItem(id);
  }

  handleRead(data, client) {
    const {id} = data;

    if(client.hasItem(id)) {
      const book = this.crumbs.books[id];

      if(!book)
        client.send('book', { content: '<book>Book not found.</book>' });
      else
        client.send('book', { content: utils.buildBook(book) });
    }
  }
}

module.exports = Item;
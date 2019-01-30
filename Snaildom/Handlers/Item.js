'use strict';

const Handler = require('../Handler');

const reload    = require('require-reload');
const items     = reload('../Crumbs/Items');
const furniture = reload('../Crumbs/Furniture');

class Item extends Handler {
  constructor(world) {
    super(world);

    this.register('buy', 'handleBuy');
    this.register('buyfurniture', 'handleBuyFurniture');
  }

  handleBuy(data, client) {
    const {id} = data;

    if(id && items[id]) {
      const item = items[id];

      if(client.gold >= item.cost) {
        client.removeGold(item.cost);
        client.addItem(item.id);
      } else
        client.alert('You don\'t have enough gold.', 'warning');
    }
  }

  handleBuyFurniture(data, client) {
    const {id} = data;

    if(id && furniture[id]) {
      const item = furniture[id];

      if(client.gold >= item.cost) {
        client.removeGold(item.cost);
        client.addFurniture(item.id);
      } else
        client.alert('You don\'t have enough gold.', 'warning');
    }
  }
}

module.exports = Item;
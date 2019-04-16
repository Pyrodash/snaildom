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

    this.register('forge', 'handleForge');
    this.register('drop', 'handleDrop');
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

  handleForge(data, client) {
    const {id} = data;
    const item = items[id];

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
}

module.exports = Item;
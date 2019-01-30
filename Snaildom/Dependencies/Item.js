'use strict';

const Dependency = require('../Dependency');
const reload     = require('require-reload');

const items      = reload('../Crumbs/Items');
const utils      = require('../Utils/Utils');

const furniture  = reload('../Crumbs/Furniture');

class Item extends Dependency {
  equip(id) {
    if(this.inventory.includes(id)) {
      const item = items[id];
      const itemId = this[item.type] == item.id ? null : item.id;

      if(item) {
        this.update(item.type, itemId);

        this.room.send('equip', {
          "id": this.id,
          "item": item.id
        });
      }
    }
  }

  addItem(id, notify) {
    const item = items[id];

    if(notify != false)
      notify = true;

    if(item) {
      this.inventory.push(item.id);

      this.updateColumn('Inventory', this.inventory.join(','));
      this.send('itemadd', {
        id: item.id,
        notify
      });
    }
  }

  addFurniture(id, notify) {
    const item = furniture[id];

    if(notify != false)
      notify = true;

    if(item) {
      this.furniture.push(item.id);

      this.updateColumn('Furniture', this.furniture.join(','));
      this.send('furnitureadd', {
        id: item.id,
        notify
      });
    }
  }

  addMaterial(id, amt, update) {
    if(!amt)
      amt = 1;

    const materials = ['iron', 'silver', 'gold'];
    id = id.toLowerCase();

    if(materials.includes(id)) {
      if(!this.materials[id])
        this.materials[id] = 0;

      this.materials[id] += amt;

      if(update !== false)
        this.updateColumn('Materials', JSON.stringify(this.materials));
    }
  }

  removeMaterial(id, amt) {
    if(!amt)
      amt = 1;

    this.addMaterial(-amt);
  }
}

module.exports = Item;
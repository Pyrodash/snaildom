'use strict';

const Dependency = require('../Dependency');

const reload     = require('require-reload');
const utils      = reload('../Utils/Utils');

class Item extends Dependency {
  equip(id) {
    if(this.inventory.includes(id)) {
      const item = this.crumbs.items[id];
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
    const item = this.crumbs.items[id];

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

  hasItem(id) {
    return this.inventory.find(item => item == id);
  }

  removeItem(id, quantity) {
    if(!quantity) quantity = 1;
    var removed = false;

    for(var i in this.inventory) {
      const item = this.inventory[i];

      if(item == id) {
        removed = true;
        this.inventory.splice(i, 1);

        if((i + 1) >= quantity)
          break;
      }
    }

    if(removed) {
      this.updateColumn('Inventory', this.inventory.join(','));
      this.send('drop', { id, quant: quantity })
    }
  }

  addFurniture(id, notify) {
    const item = this.crumbs.furniture[id];

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

  hasMaterial(id, amt) {
    if(!amt)
      amt = 1;

    return this.materials[id] && this.materials[id] >= amt;
  }

  hasMaterials(mats) {
    for(var i in mats) {
      const mat = mats[i];

      if(typeof mat != 'object') {
        if(!this.hasMaterial(i, mat))
          return false;
      } else {
        const id = mat.id || i;

        if(!this.hasMaterial(id, mat.amt))
          return false;
      }
    }

    return true;
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

  removeMaterial(id, amt, update) {
    if(!amt)
      amt = 1;

    this.addMaterial(id, -amt, update);
  }

  removeMaterials(mats) {
    for(var i in mats) {
      const mat = mats[i];

      if(typeof mat != 'object')
        this.removeMaterial(i, mat);
      else {
        const id = mat.id || i;

        this.removeMaterial(id, mat.amt, mat.update);
      }
    }
  }
}

module.exports = Item;
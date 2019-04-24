'use strict';

const utils        = require('./Utils');
const EventManager = require('./EventManager');

class Persistent extends EventManager {
  constructor() {
    super();

    this.__persistent = true;
    this.__data = {};
  }

  set(key, val) {
    if(typeof key != 'object')
      this.__data[key] = val;
    else {
      for(var i in key) {
        this.__data[i] = key[i];
      }
    }
  }

  get(key) {
    return this.__data[key];
  }

  push(key, val, index) {
    if(this.__data[key]) {
      if(!index)
        this.__data[key].push(val);
      else
        this.__data[key][index] = val;
    }
  }

  increment(key, amt) {
    if(!this.get(key)) this.set(key, 0);
    if(!amt) amt = 1;

    this.add(key, amt)
  }

  add(key, val) {
    this.__data[key] += val;
  }

  splice(key, i, len) {
    this.__data[key].splice(i, len);
  }

  delete(key) {
    this.__data[key] = null;
    delete this.__data[key];
  }
}

module.exports = Persistent;
'use strict';

const EventEmitter = require('events');

class EventManager extends EventEmitter {
  constructor() {
    super();

    this.__events = {};
  }

  addEvent(emitter, name, listener) {
    if(!this.__events[name])
      this.__events[name] = [];

    if(this.__events[name].constructor !== Array)
      this.__events[name] = [this.__events[name]];

    this.__events[name].push({
      "emitter": emitter,
      "listener": listener
    });

    emitter.on(name, listener);
  }

  removeEvent(emitter, name, listener) {
    if(emitter && name && !listener) {
      if(this.__events[name]) {
        for(var i in this.__events[name]) {
          const eventObj = this.__events[name][i];

          if(eventObj.emitter == emitter) {
            emitter.removeListener(eventObj.listener);

            this.__events[name].splice(i, 1);
          }
        }
      }

      return;
    }

    emitter.removeListener(name, listener);

    var myEventObj = {
      "emitter": emitter,
      "listener": listener
    };

    for(var i in this.__events) {
      const eventObj = this.__events[i];

      if(eventObj.constructor === Array) {
        const index = eventObj.indexOf(myEventObj);

        if(index > -1) {
          this.__events[i].splice(i, 1);

          break;
        }
      } else if(eventObj == myEventObj) {
        this.__events[i] = null;
        delete this.__events[i];
      }
    }
  }

  removeEvents(emitter) {
    for(var name in this.__events) {
      var listeners = this.__events[name];

      if(emitter && listeners.emitter && listeners.emitter != emitter)
        continue;

      if(listeners.constructor !== Array)
        this.removeEvent(listeners['emitter'], name, listeners['listener']);
      else {
        if(emitter)
          listeners = listeners.filter(listener => listener.emitter == emitter);

        for(var i in listeners) {
          this.removeEvent(listeners[i]['emitter'], name, listeners[i]['listener']);
        }
      }
    }
  }
}

module.exports = EventManager;
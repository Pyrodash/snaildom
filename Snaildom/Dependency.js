'use strict';

class Dependency {
  apply(client) {
    var ignored = ['constructor'];
    var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(method => !ignored.includes(method));

    for(var i in methods) {
      var name = methods[i];
      var method = this[name];

      if(method && typeof method == 'function')
        client[name] = method.bind(client);
    }

    client.dependencies[this.name] = this;
  }

  remove(client) {
    var ignored = ['constructor'];
    var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(method => !ignored.includes(method));
    
    for(var i in methods) {
      var name = methods[i];
      var method = this[name];

      if(method) {
        client[name] = null;
        delete client[name];
      }
    }

    client.dependencies[this.name] = null;
    delete client.dependencies[this.name];
  }
}

module.exports = Dependency;
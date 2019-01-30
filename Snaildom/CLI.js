'use strict';

class CLI {
  constructor() {
    this.stdin = process.openStdin();

    this.listen();
  }

  listen() {
    this.stdin.on('data', data => {
      data = data.toString().trim();

      var params = data.split(' ').slice(1);

      for(var i in this.commands) {
        const handler = this.commands[i];

        if(data.toLowerCase().startsWith(i)) {
          const cmdPrefix = i.split(' ').slice(1);

          if(cmdPrefix.length > 0)
            params = params.slice(cmdPrefix.length);

          if(handler.process && typeof handler.process == 'function')
            if(!handler.single)
              handler.process(...params);
            else
              handler.process(params.join(' '));

          break;
        }
      }
    });
  }

  register(command, handler, singleParameter) {
    if(!this.commands)
      this.commands = {};

    command = command.toLowerCase();
    this.commands[command] = {
      "process": handler
    };

    if(singleParameter)
      this.commands[command]['single'] = true;
  }
}

module.exports = CLI;
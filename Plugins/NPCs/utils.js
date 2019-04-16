const reload = require('require-reload')(require);
const Utils  = reload('../../Snaildom/Utils/Utils');

const Topics = reload('./Topics');
const NPCs   = reload('./NPCs');

const nargs = /\{([0-9a-zA-Z._]+)\}/g;

const utils = {
  rand: Utils.rand,
  format: function(string) {
    // Credits to https://github.com/Matt-Esch/

    var args;

    if(arguments.length === 2 && typeof arguments[1] === "object")
      args = arguments[1];
    else {
      args = new Array(arguments.length - 1);

      for (var i = 1; i < arguments.length; ++i) {
        args[i - 1] = arguments[i];
      }
    }

    if (!args || !args.hasOwnProperty)
      args = {};

    return string.replace(nargs, function replaceArg(match, i, index) {
      var result;

      if(string[index - 1] === "{" && string[index + match.length] === "}")
        return i;
      else {
        const params = i.split('.');
        result = args;

        for(var n in params) {
          const param = params[n];

          if(result.hasOwnProperty(param))
            result = result[param];
          else {
            result = null;

            break;
          }
        }

        if(result === null || result === undefined)
          return '';

        return result;
      }
    });
  },
  parseMessage: function(message) {
    return message.map(msg => {
      if(msg.constructor === Array)
        msg = msg.join('&break; ');

      return msg;
    }).join('|');
  },
  parseDialogue: function(dialogue) {
    if(!dialogue)
      return null;

    if(dialogue.message && dialogue.message.constructor === Array)
      dialogue.message = utils.parseMessage(dialogue.message);

    return dialogue;
  },
  parseReferences: function(item) {
    for(var i in item) {
      const val = item[i];

      for(var Reference of references) {
        const reference = String(val).split(Reference.prefix);

        if(reference.length == 2 && !isNaN(reference[1])) {
          const refId = reference[1];
          var ref = Reference.find ? Reference.find(refId) : Reference.container.find(item => item.id == refId);

          if(ref) {
            if(Reference.parse)
              ref = Reference.parse(ref);

            item[i] = ref[i];
          }
        }
      }
    }

    return item;
  },
  parseTopic: function(topic) {
    topic = utils.parseReferences(topic);

    return utils.parseDialogue(topic);
  },
  parseTopics: function(topics) {
    return topics.map(utils.parseTopic);
  },
  parseNPC: function(npc) {
    npc.dialogue = utils.parseDialogue(npc.dialogue);
    
    return npc;
  },
  parseNPCs: function(npcs) {
    return npcs.map(utils.parseNPC);
  }
};

const references = [{ prefix: 't.', container: Topics, parse: utils.parseTopic }, { prefix: 'n.', container: NPCs, parse: utils.parseNPC }];

module.exports = utils;
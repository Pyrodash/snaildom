const latinMap = require('./LatinMap');
const nargs = /\{([0-9a-zA-Z._]+)\}/g;

function padLeft(num, base, chr) {
  var len = (String(base || 10).length - String(num).length) + 1;

  return len > 0 ? new Array(len).join(chr || '0') + num : num;
}

const utils = {
  rand: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  require: function(mdl, def) {
    if(def === undefined)
      def = false;

    try {
      mdl = require(mdl);
    } catch(e) {
      mdl = def;
    }

    return mdl;
  },
  ucfirst: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  parse: function(json, def) {
    if(typeof json == 'object')
      return json;
    if(def === undefined)
      def = false;

    try {
      json = JSON.parse(json);
    } catch(e) {
      json = def;
    }

    return json;
  },
  parseInt: function(int, def) {
    if(def === undefined)
      def = 0;

    return isNaN(int) ? def : Number(int);
  },
  isEmpty: function(str){
    return str === null || str.match(/^ *$/) !== null;
  },
  isNumber: function(num) {
    return num && !isNaN(num) && num > 0;
  },
  formatNumber: function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  replaceUnicode: function(str) {
    var newStr = '';

    for(var i = 0; i < str.length; i++) {
      const chr = str[i];

      newStr += latinMap[chr] ? latinMap[chr] : chr;
    }

    return newStr;
  },
  escapeHTML: function(str) {
    return str
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
  },
  parseFurniture: function(furniture) {
    return furniture.split('|').filter(o => o).map(object => {
      object = object.split(':');

      return {
        id: object[0],
        x: Number(object[1]),
        y: Number(object[2]),
        frame: object[3] && !isNaN(object[3]) ? object[3] : 1,
        frame2: object[4] && !isNaN(object[4]) ? object[4] : 1
      };
    });
  },
  furnitureToString: function(furn) {
    return furn.map(item => [item.id, item.x, item.y, (item.frame || 1), (item.frame2 || 1)].join(':')).join('|');
  },
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
  logDate: function(d) {
    if(!d)
      d = new Date();

    return [padLeft(d.getMonth()+1),
             padLeft(d.getDate()),
             d.getFullYear()].join('-') + ' ' +
            [padLeft(d.getHours()),
             padLeft(d.getMinutes()),
             padLeft(d.getSeconds())].join(':');
  }
};

module.exports = utils;
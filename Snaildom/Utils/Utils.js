const latinMap = require('./LatinMap');

const utils = {
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
  parse: function(json) {
    if(typeof json == 'object')
      return json;

    try {
      json = JSON.parse(json);
    } catch(e) {
      json = false;
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
  }
};

module.exports = utils;
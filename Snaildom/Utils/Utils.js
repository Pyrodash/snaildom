const latinMap = require('./LatinMap');

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
  logDate: function(d) {
    if(!d)
      d = new Date();

    return [padLeft(d.getMonth()+1),
             padLeft(d.getDate()),
             d.getFullYear()].join('-') + ' ' +
            [padLeft(d.getHours()),
             padLeft(d.getMinutes()),
             padLeft(d.getSeconds())].join(':');
  },
  sleep: function(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  },
  findDistance: function(...args) {
    if(args.length == 2) {
      const p1 = args[0];
      const p2 = args[1];

      return utils.findDistance(p1.x, p1.y, p2.x, p2.y);
    } else {
      const x1 = args.shift();
      const y1 = args.shift();

      const x2 = args.shift();
      const y2 = args.shift();

      return Math.hypot(x2 - x1, y2 - y1);
    }
  },
  findAngle: function(x1, y1, x2, y2) {
		var _local3 = x2 - x1;
		var _local2 = y2 - y1;
		var _local1 = Number((Math.atan2(_local2, _local3) * 57.2957795130823) - 90);

		if(_local1 < 0)
			return _local1 + 360;

		return _local1;
	},
	findDirection: function(angle) {
		var _local1 = Math.round(angle / 45) + 1;

		if (_local1 > 8)
			_local1 = 1;

		return _local1;
	},
  getDuration: function(x1, y1, x2, y2)
  {
     var _loc2_ = x2 - x1;
     var _loc1_ = y2 - y1;
     var _loc3_ = Math.sqrt(_loc2_ * _loc2_ + _loc1_ * _loc1_);

     // onEnterFrame runs at 24 frames per second
     // That's 0.024 frames per millisecond
     // So 1 frame per 41.66666666666667 milliseconds

     return (_loc3_ / 3) * 41.66666666666667;
  },
  randX: function(room) {
    if(room && room.randX)
      return room.randX();

    return utils.rand(100, 700);
  },
  randY: function(room) {
    if(room && room.randY)
      return room.randY();

    return utils.rand(100, 400);
  },
  flatten: function(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }
};

module.exports = utils;
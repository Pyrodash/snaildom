'use strict';

const Dependency = require('../Dependency');

class Faction extends Dependency {
  parseFactions(factions) {
    factions = factions.map(faction => faction.split(':')).filter(faction => faction[0]);

    const f = [];

    for(var i in factions) {
      const faction = factions[i];
      const factionObj = findFaction(faction[0], this.crumbs.factions);

      if(!factionObj) continue;

      const {id} = factionObj;

      if(!factionObj.tiers[faction[1]])
        faction[1] = Object.keys(factionObj.tiers)[0];

      f.push({
        id: id,
        tier: faction[1]
      });
    }

    return f;
  }

  getFactions() {
    return this.factions;
  }

  hasFaction(search) {
    const type = isNaN(search) ? 'string' : 'internal';

    return this.factions.find(faction => {
      if(type == 'internal')
        return faction[type] == search;
      else {
        if(faction.id == search)
          return true;
        else {
          const obj = Factions[faction.id];

          return obj && obj.name == search;
        }
      }
    });
  }
}

function findFaction(f, factions) {
  const type = isNaN(f) ? 'string' : 'internal';

  for(var i in factions) {
    const faction = factions[i];

    if(type == 'internal' && faction[type] == f)
      return faction;
    else {
      if(faction.id == f || faction.name == f)
        return faction;
    }
  }

  return false;
}

module.exports = Faction;
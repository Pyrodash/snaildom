'use strict';

const Filter  = require('bad-words');
const filter  = new Filter;

filter.removeWords('retard');

module.exports = filter;
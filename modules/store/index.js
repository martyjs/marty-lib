'use strict';

module.exports = function (marty) {
  marty.when = require('./when');
  marty.fetch = require('./fetch');
  marty.Store = require('./store');
  marty.handles = require('./handles');
  marty.createStore = require('./createStoreClass');
};
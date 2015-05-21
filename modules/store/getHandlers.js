'use strict';

var _require = require('../mindash');

var extend = _require.extend;

function getHandlers(store) {
  return extend({}, store.handlers, store.constructor.handlers);
}

module.exports = getHandlers;
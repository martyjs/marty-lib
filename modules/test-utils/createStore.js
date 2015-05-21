'use strict';

var _require = require('../mindash');

var noop = _require.noop;
var extend = _require.extend;

function createStore(properties) {
  return extend({ addChangeListener: noop }, properties);
}

module.exports = createStore;
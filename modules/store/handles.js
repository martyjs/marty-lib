'use strict';

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

var _require = require('../mindash');

var toArray = _require.toArray;
var extend = _require.extend;

function handles() {
  var constants = toArray(arguments);

  return function (target, name, descriptor) {
    target.handlers = extend({}, target.handlers, _defineProperty({}, name, constants));

    return descriptor;
  };
}

module.exports = handles;
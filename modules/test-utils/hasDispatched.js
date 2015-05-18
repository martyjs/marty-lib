'use strict';

var _require = require('../mindash');

var filter = _require.filter;
var isEqual = _require.isEqual;

var getDispatchedActionsWithType = require('./getDispatchedActionsWithType');

function hasDispatched(app, type) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var actions = filter(getDispatchedActionsWithType(app, type), function (action) {
    return isEqual(action.arguments, args);
  });

  return !!actions.length;
}

module.exports = hasDispatched;
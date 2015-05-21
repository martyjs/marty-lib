'use strict';

var _ = require('../mindash');

function getDispatchedActions(app, type) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return _.filter(app.dispatcher.dispatchedActions, function (action) {
    return action.type === type && _.isEqual(action.arguments, args);
  });
}

module.exports = getDispatchedActions;
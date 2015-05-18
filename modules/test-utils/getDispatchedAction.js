'use strict';

var _ = require('../mindash');

function getDispatchedActions(app, type) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var actions = _.find(app.dispatcher.dispatchedActions, {
    type: type
  });

  return _.filter(actions, function (action) {
    return _.isEqual(action.arguments, args);
  });
}

module.exports = getDispatchedActions;
'use strict';

var _require = require('../mindash');

var filter = _require.filter;

function getDispatchedActionsWithType(app, type) {
  return filter(app.dispatcher.dispatchedActions, function (action) {
    return action.type === type;
  });
}

module.exports = getDispatchedActionsWithType;
let { filter, isEqual } = require('../mindash');
let getDispatchedActionsWithType = require('./getDispatchedActionsWithType');

function hasDispatched(app, type, ...args) {
  let actions = filter(getDispatchedActionsWithType(app, type), action => {
    return isEqual(action.arguments, args);
  });

  return !!actions.length;
}

module.exports = hasDispatched;
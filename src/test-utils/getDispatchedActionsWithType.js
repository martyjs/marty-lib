var { filter } = require('../mindash');

function getDispatchedActionsWithType(app, type) {
  return filter(app.dispatcher.dispatchedActions, action => {
    return action.type === type;
  });
}

module.exports = getDispatchedActionsWithType;
var _ = require('marty-core')._;
var ActionHandlerNotFoundError = require('marty-core').errors.ActionHandlerNotFoundError;
var ActionPredicateUndefinedError = require('marty-core').errors.ActionPredicateUndefinedError;

function validateHandlers(store) {
  _.each(store.handlers, function (actionPredicate, handlerName) {
    var actionHandler = store[handlerName];

    if (_.isUndefined(actionHandler) || _.isNull(actionHandler)) {
      throw new ActionHandlerNotFoundError(handlerName, store);
    }

    if (!actionPredicate) {
      throw new ActionPredicateUndefinedError(handlerName, store);
    }
  });
}

module.exports = validateHandlers;
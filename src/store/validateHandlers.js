let _ = require('../mindash');
let ActionHandlerNotFoundError = require('../errors/actionHandlerNotFoundError');
let ActionPredicateUndefinedError = require('../errors/actionPredicateUndefinedError');

function validateHandlers(store) {
  _.each(store.handlers, (actionPredicate, handlerName) => {
    let actionHandler = store[handlerName];

    if (_.isUndefined(actionHandler) || _.isNull(actionHandler)) {
      throw new ActionHandlerNotFoundError(handlerName, store);
    }

    if (!actionPredicate) {
      throw new ActionPredicateUndefinedError(handlerName, store);
    }
  });
}

module.exports = validateHandlers;
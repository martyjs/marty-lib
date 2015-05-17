let _ = require('../mindash');
let getHandlers = require('./getHandlers');
let ActionHandlerNotFoundError = require('../errors/actionHandlerNotFoundError');
let ActionPredicateUndefinedError = require('../errors/actionPredicateUndefinedError');

function validateHandlers(store) {
  _.each(getHandlers(store), (actionPredicate, handlerName) => {
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
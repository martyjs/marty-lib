let _ = require('../mindash');

function handleAction(action) {
  this.__validateHandlers();

  let store = this;
  let handlers = _.object(_.map(store.handlers, getHandlerWithPredicates));

  _.each(handlers, function (predicates, handlerName) {
    _.each(predicates, function (predicate) {
      if (predicate(action)) {
        store.action = action;
        action.addStoreHandler(store, handlerName);
        store[handlerName].apply(store, action.arguments);
      }
    });
  });
}

function getHandlerWithPredicates(constants, handler) {
  _.isArray(constants) || (constants = [constants]);

  let predicates = _.map(constants, toPredicate);

  return [handler, predicates];

  function toPredicate(constant) {
    return function (action) {
      return action.type === constant;
    };
  }
}

module.exports = handleAction;
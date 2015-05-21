'use strict';

var _ = require('../mindash');
var getHandlers = require('./getHandlers');

function handleAction(action) {
  this.__validateHandlers();

  var store = this;
  var handlers = _.object(_.map(getHandlers(store), getHandlerWithPredicates));

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

  var predicates = _.map(constants, toPredicate);

  return [handler, predicates];

  function toPredicate(constant) {
    return function (action) {
      return action.type === constant;
    };
  }
}

module.exports = handleAction;
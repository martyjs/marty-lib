'use strict';

var _ = require('../mindash');
var getHandlers = require('./getHandlers');
var ActionHandlerNotFoundError = require('../errors/actionHandlerNotFoundError');
var ActionPredicateUndefinedError = require('../errors/actionPredicateUndefinedError');

function validateHandlers(store) {
  _.each(getHandlers(store), function (actionPredicate, handlerName) {
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
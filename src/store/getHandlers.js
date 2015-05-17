let { extend } = require('../mindash');

function getHandlers(store) {
  return extend({}, store.handlers, store.constructor.handlers);
}

module.exports = getHandlers;
let { noop, extend } = require('../mindash');

function createStore(properties) {
  return extend({ addChangeListener: noop }, properties);
}

module.exports = createStore;
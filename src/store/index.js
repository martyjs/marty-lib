let _ = require('../mindash');
let when = require('./when');
let fetch = require('./fetch');
let Store = require('./store');
let state = require('./state');
let fetchConstants = require('./fetchConstants');
let createStoreClass = require('./createStoreClass');

module.exports = function (marty) {
  marty.registerClass('Store', Store);
  marty.register('createStore', createStore);

  _.each(state, function (value, key) {
    marty.register(key, value);
  });

  function createStore(properties) {
    let StoreClass = createStoreClass(properties);
    let defaultInstance = this.register(StoreClass);

    return defaultInstance;
  }
};

module.exports.when = when;
module.exports.fetch = fetch;
module.exports.Store = Store;
module.exports.fetchConstants = fetchConstants;
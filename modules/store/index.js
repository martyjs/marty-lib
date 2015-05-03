var _ = require('../mindash');
var when = require('./when');
var fetch = require('./fetch');
var Store = require('./store');
var state = require('./state');
var fetchConstants = require('./fetchConstants');
var createStoreClass = require('./createStoreClass');

module.exports = function (marty) {
  marty.registerClass('Store', Store);
  marty.register('createStore', createStore);

  _.each(state, function (value, key) {
    marty.register(key, value);
  });

  function createStore(properties) {
    var StoreClass = createStoreClass(properties);
    var defaultInstance = this.register(StoreClass);

    return defaultInstance;
  }
};

module.exports.when = when;
module.exports.fetch = fetch;
module.exports.Store = Store;
module.exports.fetchConstants = fetchConstants;
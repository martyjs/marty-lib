var when = require('./lib/when');
var fetch = require('./lib/fetch');
var Store = require('./lib/store');
var state = require('./lib/state');
var _ = require('marty-core/lib/mindash');
var fetchConstants = require('./lib/fetchConstants');
var createStoreClass = require('./lib/createStoreClass');

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
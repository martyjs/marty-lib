let _ = require('../mindash');
let when = require('./when');
let fetch = require('./fetch');
let Store = require('./store');
let fetchConstants = require('./fetchConstants');
let createStoreClass = require('./createStoreClass');

module.exports = function (marty) {
  marty.registerClass('Store', Store);
  marty.register('createStore', createStore);

  function createStore(properties) {
    let StoreClass = createStoreClass(properties);
    let defaultInstance = this.register(StoreClass);

    return defaultInstance;
  }
};
module.exports = function (marty) {
  marty.when = require('./when');
  marty.fetch = require('./fetch');
  marty.Store = require('./store');
  marty.createStore = require('./createStoreClass');
};
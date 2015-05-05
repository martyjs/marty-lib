module.exports = function (marty) {
  marty.Store = require('./store');
  marty.createStore = require('./createStoreClass');
};
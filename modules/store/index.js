'use strict';

module.exports = function (marty) {
  marty.registerClass('Store', require('./store'));
  marty.register('createStore', require('./createStoreClass'));
};
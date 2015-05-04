let _ = require('../mindash');
let when = require('./when');
let fetch = require('./fetch');
let Store = require('./store');
let fetchConstants = require('./fetchConstants');

module.exports = function (marty) {
  marty.registerClass('Store', Store);
  marty.register('createStore', require('./createStoreClass'));
};
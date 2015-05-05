let LocalStorageStateSource = require('./localStorage');
let registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(
    marty,
    'LocalStorageStateSource',
    'localStorage',
    LocalStorageStateSource
  );
};
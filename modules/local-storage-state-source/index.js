var LocalStorageStateSource = require('./localStorage');

module.exports = function (marty) {
  marty.registerStateSource(
    'LocalStorageStateSource',
    'localStorage',
    LocalStorageStateSource
  );
};
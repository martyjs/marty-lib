var LocalStorageStateSource = require('./lib/localStorage');

module.exports = function (marty) {
  marty.registerStateSource(
    'LocalStorageStateSource',
    'localStorage',
    LocalStorageStateSource
  );
};
var JSONStorageStateSource = require('./lib/jsonStorage');

module.exports = function (marty) {
  marty.registerStateSource(
    'JSONStorageStateSource',
    'jsonStorage',
    JSONStorageStateSource
  );
};
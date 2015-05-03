let JSONStorageStateSource = require('./jsonStorage');

module.exports = function (marty) {
  marty.registerStateSource(
    'JSONStorageStateSource',
    'jsonStorage',
    JSONStorageStateSource
  );
};
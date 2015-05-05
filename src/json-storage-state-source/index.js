let JSONStorageStateSource = require('./jsonStorage');
let registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(
    marty,
    'JSONStorageStateSource',
    'jsonStorage',
    JSONStorageStateSource
  );
};
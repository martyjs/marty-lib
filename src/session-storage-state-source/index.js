let SessionStorageStateSource = require('./sessionStorage');
let registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(
    marty,
    'SessionStorageStateSource',
    'sessionStorage',
    SessionStorageStateSource
  );
};
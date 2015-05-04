let SessionStorageStateSource = require('./sessionStorage');

module.exports = function (marty) {
  marty.registerStateSource(
    'SessionStorageStateSource',
    'sessionStorage',
    SessionStorageStateSource
  );
};
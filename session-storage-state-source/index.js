var SessionStorageStateSource = require('./lib/sessionStorage');

module.exports = function (marty) {
  marty.registerStateSource(
    'SessionStorageStateSource',
    'sessionStorage',
    SessionStorageStateSource
  );
};
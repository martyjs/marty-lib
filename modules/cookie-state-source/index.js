var CookieStateSource = require('./cookie');

module.exports = function (marty) {
  marty.registerStateSource(
    'CookieStateSource',
    'cookie',
    CookieStateSource
  );
};
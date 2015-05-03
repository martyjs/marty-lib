var CookieStateSource = require('./lib/cookie');

module.exports = function (marty) {
  marty.registerStateSource(
    'CookieStateSource',
    'cookie',
    CookieStateSource
  );
};
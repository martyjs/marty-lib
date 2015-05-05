let CookieStateSource = require('./cookie');
let registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(
    marty,
    'CookieStateSource',
    'cookie',
    CookieStateSource
  );
};
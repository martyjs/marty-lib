'use strict';

var CookieStateSource = require('./cookie');
var registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(marty, 'CookieStateSource', 'cookie', CookieStateSource);
};
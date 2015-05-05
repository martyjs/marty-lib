'use strict';

var SessionStorageStateSource = require('./sessionStorage');
var registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(marty, 'SessionStorageStateSource', 'sessionStorage', SessionStorageStateSource);
};
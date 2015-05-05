'use strict';

var JSONStorageStateSource = require('./jsonStorage');
var registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(marty, 'JSONStorageStateSource', 'jsonStorage', JSONStorageStateSource);
};
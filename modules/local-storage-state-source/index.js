'use strict';

var LocalStorageStateSource = require('./localStorage');
var registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(marty, 'LocalStorageStateSource', 'localStorage', LocalStorageStateSource);
};
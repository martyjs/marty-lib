'use strict';

var LocationStateSource = require('./location');
var registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(marty, 'LocationStateSource', 'location', LocationStateSource);
};
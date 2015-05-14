'use strict';

var HttpStateSource = require('./http');
var registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(marty, 'HttpStateSource', 'http', HttpStateSource);

  marty.hooks = require('./hooks');
};
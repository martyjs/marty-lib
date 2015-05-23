'use strict';

module.exports = function (marty, React) {
  marty.createAppMixin = require('./createAppMixin')(React);
};
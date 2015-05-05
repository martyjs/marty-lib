'use strict';

module.exports = function (marty, React) {
  marty.createStateMixin = require('./createStateMixin')(React);
};
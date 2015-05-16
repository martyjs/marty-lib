'use strict';

module.exports = function (marty, React) {
  marty.inject = require('./inject')(React);
};
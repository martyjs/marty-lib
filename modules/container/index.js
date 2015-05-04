'use strict';

module.exports = function (marty, React) {
  marty.register('createContainer', require('./createContainer')(React));
};
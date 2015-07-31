'use strict';

var findApp = require('./findApp');

function appProperty(obj) {
  if (!obj.hasOwnProperty('app')) {
    Object.defineProperty(obj, 'app', {
      get: function get() {
        return findApp(this);
      },
      set: function set() {
        /* Do nothing until https://github.com/gaearon/react-hot-api/pull/16 is resolves */
      }
    });
  }
}

module.exports = appProperty;
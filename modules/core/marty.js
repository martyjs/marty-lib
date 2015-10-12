'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');

var Marty = function Marty(version, react, reactDomServer) {
  _classCallCheck(this, Marty);

  this.version = version;
  this.stateSources = {};

  this.use = function use(cb) {
    if (!_.isFunction(cb)) {
      throw new Error('Must pass in a function');
    }

    cb(this, react, reactDomServer);
  };
};

module.exports = Marty;
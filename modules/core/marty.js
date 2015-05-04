'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');
var MartyBuilder = require('./martyBuilder');

var Marty = function Marty(version, react) {
  _classCallCheck(this, Marty);

  var builder = new MartyBuilder(this);

  this.version = version;

  this.use = function use(cb) {
    if (!_.isFunction(cb)) {
      throw new Error('Must pass in a function');
    }

    cb(builder, react);
  };
};

module.exports = Marty;
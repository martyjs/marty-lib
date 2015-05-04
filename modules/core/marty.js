'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');
var Registry = require('./registry');
var MartyBuilder = require('./martyBuilder');
var createDispatcher = require('./createDispatcher');

var Marty = function Marty(version, react) {
  _classCallCheck(this, Marty);

  var dispatcher = createDispatcher();
  var builder = new MartyBuilder(this);
  var registry = new Registry({
    defaultDispatcher: dispatcher
  });

  this.version = version;
  Object.defineProperty(this, 'registry', {
    get: function get() {
      if (this.warnings && this.warnings.appIsTheFuture) {
        this.logger.warn('Warning: The global registry is being depreciated. ' + 'Please move to using application\'s instead. ' + 'http://martyjs.org/depreciated/singelton.html');
      }

      return registry;
    }
  });

  Object.defineProperty(this, 'dispatcher', {
    get: function get() {
      if (this.warnings && this.warnings.appIsTheFuture) {
        this.logger.warn('Warning: The global dispatcher is being depreciated. ' + 'Please move to using application\'s instead. ' + 'http://martyjs.org/depreciated/singelton.html');
      }

      return dispatcher;
    }
  });

  this.use = function use(cb) {
    if (!_.isFunction(cb)) {
      throw new Error('Must pass in a function');
    }

    cb(builder, react);
  };
};

module.exports = Marty;
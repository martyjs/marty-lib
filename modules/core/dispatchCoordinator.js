'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var log = require('./logger');
var uuid = require('./utils/uuid');
var warnings = require('./warnings');
var resolve = require('./utils/resolve');
var Environment = require('./environment');

var DispatchCoordinator = (function () {
  function DispatchCoordinator(type, options) {
    _classCallCheck(this, DispatchCoordinator);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    options = options || {};

    this.__type = type;
    this.__isCoreType = true;
    this.__app = options.app;
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
    this.__dispatcher = options.dispatcher;
  }

  _createClass(DispatchCoordinator, [{
    key: 'dispatch',
    value: function dispatch(type) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.__dispatcher.dispatchAction({
        type: type,
        arguments: args
      });
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'app',
    get: function () {
      return this.__app;
    }
  }, {
    key: 'context',
    get: function () {
      return this.__context;
    }
  }]);

  return DispatchCoordinator;
})();

module.exports = DispatchCoordinator;
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('../mindash');
var invariant = require('invariant');
var cookieFactory = defaultCookieFactory;
var StateSource = require('../core/stateSource');

var CookieStateSource = (function (_StateSource) {
  _inherits(CookieStateSource, _StateSource);

  function CookieStateSource(options) {
    _classCallCheck(this, CookieStateSource);

    _get(Object.getPrototypeOf(CookieStateSource.prototype), 'constructor', this).call(this, options);
    this._isCookieStateSource = true;
    this._cookies = cookieFactory(this.app);
  }

  _createClass(CookieStateSource, [{
    key: 'get',
    value: function get(key) {
      invariant(_.isString(key), 'key must be a string');

      return this._cookies.get(key);
    }
  }, {
    key: 'set',
    value: function set(key, value, options) {
      invariant(_.isString(key), 'key must be a string');

      return this._cookies.set(key, value, options);
    }
  }, {
    key: 'expire',
    value: function expire(key) {
      invariant(_.isString(key), 'key must be a string');

      return this._cookies.expire(key);
    }
  }], [{
    key: 'setCookieFactory',
    value: function setCookieFactory(value) {
      cookieFactory = value;
    }
  }]);

  return CookieStateSource;
})(StateSource);

function defaultCookieFactory() {
  return require('cookies-js');
}

module.exports = CookieStateSource;
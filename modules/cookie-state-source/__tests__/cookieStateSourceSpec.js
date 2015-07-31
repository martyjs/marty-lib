'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('CookieStateSource', function (styles) {
  var source, cookies, Marty;

  beforeEach(function () {
    Marty = buildMarty();
    cookies = require('cookies-js');
    var CookieSource = styles({
      classic: function classic() {
        return Marty.createStateSource({
          type: 'cookie'
        });
      },
      es6: function es6() {
        return (function (_Marty$CookieStateSource) {
          _inherits(Cookies, _Marty$CookieStateSource);

          function Cookies() {
            _classCallCheck(this, Cookies);

            _get(Object.getPrototypeOf(Cookies.prototype), 'constructor', this).apply(this, arguments);
          }

          return Cookies;
        })(Marty.CookieStateSource);
      }
    });

    source = new CookieSource();
  });

  describe('#set()', function () {
    beforeEach(function () {
      source.set('foo', 'bar');
    });

    it('should set the key in the cookie', function () {
      expect(cookies.get('foo')).to.equal('bar');
    });
  });

  describe('when you pass in a non string', function () {
    it('should throw an error', function () {
      expect(settingNonString).to['throw'](Error);

      function settingNonString() {
        source.set(123, 'bar');
      }
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      cookies.set('foo', 'bar');
    });

    it('should retrieve data under key in cookie', function () {
      expect(source.get('foo')).to.equal('bar');
    });
  });

  describe('#expire()', function () {
    beforeEach(function () {
      cookies.set('foo', 'bar');

      source.expire('foo');
    });

    it('should retrieve data under key in cookie', function () {
      expect(source.get('foo')).to.not.exist;
    });
  });
});
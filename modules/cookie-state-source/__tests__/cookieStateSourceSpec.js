'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

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
          function Cookies() {
            _classCallCheck(this, Cookies);

            if (_Marty$CookieStateSource != null) {
              _Marty$CookieStateSource.apply(this, arguments);
            }
          }

          _inherits(Cookies, _Marty$CookieStateSource);

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
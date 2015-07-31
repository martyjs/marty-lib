'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('LocationStateSource', function (styles) {
  var source, Marty;

  beforeEach(function () {
    Marty = buildMarty();
    var Source = styles({
      classic: function classic() {
        return Marty.createStateSource({
          type: 'location'
        });
      },
      es6: function es6() {
        return (function (_Marty$LocationStateSource) {
          _inherits(CurrentLocation, _Marty$LocationStateSource);

          function CurrentLocation() {
            _classCallCheck(this, CurrentLocation);

            _get(Object.getPrototypeOf(CurrentLocation.prototype), 'constructor', this).apply(this, arguments);
          }

          return CurrentLocation;
        })(Marty.LocationStateSource);
      }
    });

    source = new Source();
  });

  describe('#getLocation()', function () {
    var actualLocation;

    beforeEach(function () {
      actualLocation = source.getLocation({
        url: 'http://foo.com/',
        protocol: 'http:',
        search: '?foo=bar&baz=bam',
        pathname: '/foo',
        hostname: 'foo.com'
      });
    });

    it('should return the correct url', function () {
      expect(actualLocation.url).to.equal('http://foo.com/');
    });

    it('should return the correct protocol', function () {
      expect(actualLocation.protocol).to.equal('http');
    });

    it('should return the correct query', function () {
      expect(actualLocation.query).to.eql({
        foo: 'bar',
        baz: 'bam'
      });
    });

    it('should return the correct path', function () {
      expect(actualLocation.path).to.eql('/foo');
    });

    it('should return the correct hostname', function () {
      expect(actualLocation.hostname).to.eql('foo.com');
    });
  });
});
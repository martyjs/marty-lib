'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

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
          function CurrentLocation() {
            _classCallCheck(this, CurrentLocation);

            if (_Marty$LocationStateSource != null) {
              _Marty$LocationStateSource.apply(this, arguments);
            }
          }

          _inherits(CurrentLocation, _Marty$LocationStateSource);

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
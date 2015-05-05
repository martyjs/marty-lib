'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('SessionStorageStateSource', function (styles) {
  var source, Marty;

  beforeEach(function () {
    Marty = buildMarty();
    sessionStorage.clear();
    var Source = styles({
      classic: function classic() {
        return Marty.createStateSource({
          type: 'sessionStorage'
        });
      },
      es6: function es6() {
        return (function (_Marty$SessionStorageStateSource) {
          function SessionStorage() {
            _classCallCheck(this, SessionStorage);

            if (_Marty$SessionStorageStateSource != null) {
              _Marty$SessionStorageStateSource.apply(this, arguments);
            }
          }

          _inherits(SessionStorage, _Marty$SessionStorageStateSource);

          return SessionStorage;
        })(Marty.SessionStorageStateSource);
      }
    });

    source = new Source();
  });

  describe('#createRepository()', function () {
    it('should expose get and set methods', function () {
      expect(source).to.have.property('get');
      expect(source).to.have.property('set');
    });
  });

  describe('#set()', function () {
    beforeEach(function () {
      source.set('foo', 'bar');
    });

    it('should store data under key in sessionStorage', function () {
      expect(sessionStorage.getItem('foo')).to.equal('bar');
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      sessionStorage.setItem('foo', 'bar');
    });

    it('should retrieve data under key in sessionStorage', function () {
      expect(source.get('foo')).to.equal('bar');
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      var Source = styles({
        classic: function classic() {
          return Marty.createStateSource({
            namespace: 'baz',
            type: 'sessionStorage'
          });
        },
        es6: function es6() {
          return (function (_Marty$SessionStorageStateSource2) {
            function SessionStorage() {
              _classCallCheck(this, SessionStorage);

              if (_Marty$SessionStorageStateSource2 != null) {
                _Marty$SessionStorageStateSource2.apply(this, arguments);
              }
            }

            _inherits(SessionStorage, _Marty$SessionStorageStateSource2);

            _createClass(SessionStorage, [{
              key: 'namespace',
              get: function () {
                return 'baz';
              }
            }]);

            return SessionStorage;
          })(Marty.SessionStorageStateSource);
        }
      });

      source = new Source();
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          sessionStorage.setItem('bazfoo', 'bar');
        });

        it('should prepend namespace to key', function () {
          expect(source.get('foo')).to.equal('bar');
        });
      });

      describe('when storing data', function () {
        beforeEach(function () {
          source.set('foo', 'bar');
        });

        it('should prepend namespace to key', function () {
          expect(sessionStorage.getItem('bazfoo')).to.equal('bar');
        });
      });
    });
  });
});
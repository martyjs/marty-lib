'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('JSONStorageStateSource', function (styles) {
  var source, payload, serializedPayload, Marty;

  payload = {
    value: {
      bar: 'bar'
    }
  };
  serializedPayload = JSON.stringify(payload);

  beforeEach(function () {
    Marty = buildMarty();

    localStorage.clear();
    sessionStorage.clear();
    var Source = styles({
      classic: function classic() {
        return Marty.createStateSource({
          type: 'jsonStorage'
        });
      },
      es6: function es6() {
        return (function (_Marty$JSONStorageStateSource) {
          _inherits(StateSource, _Marty$JSONStorageStateSource);

          function StateSource() {
            _classCallCheck(this, StateSource);

            _get(Object.getPrototypeOf(StateSource.prototype), 'constructor', this).apply(this, arguments);
          }

          return StateSource;
        })(Marty.JSONStorageStateSource);
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
      source.set('foo', payload.value);
    });

    it('should store serialized data under key in localStorage', function () {
      var raw = localStorage.getItem('foo');
      expect(raw).to.equal(serializedPayload);
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      localStorage.setItem('foo', serializedPayload);
    });

    it('should retrieve serialized data under key in localStorage', function () {
      expect(source.get('foo')).to.deep.equal(payload.value);
    });

    describe('when the value is undefined', function () {
      var result;

      beforeEach(function () {
        result = source.get('bar');
      });

      it('should return null', function () {
        expect(result).to.equal(null);
      });
    });
  });

  describe('#storage', function () {
    describe('when you pass in a custom web storage object', function () {
      beforeEach(function () {
        var Source = styles({
          classic: function classic() {
            return Marty.createStateSource({
              type: 'jsonStorage',
              storage: sessionStorage
            });
          },
          es6: function es6() {
            return (function (_Marty$JSONStorageStateSource2) {
              _inherits(StateSource, _Marty$JSONStorageStateSource2);

              function StateSource() {
                _classCallCheck(this, StateSource);

                _get(Object.getPrototypeOf(StateSource.prototype), 'constructor', this).apply(this, arguments);
              }

              _createClass(StateSource, [{
                key: 'storage',
                get: function get() {
                  return sessionStorage;
                }
              }]);

              return StateSource;
            })(Marty.JSONStorageStateSource);
          }
        });

        source = new Source();

        source.set('foo', payload.value);
      });
      it('should use the custom web storage object', function () {
        expect(sessionStorage.getItem('foo')).to.equal(serializedPayload);
      });
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      var Source = Marty.createStateSource({
        namespace: 'baz',
        type: 'jsonStorage'
      });

      source = new Source();
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          localStorage.setItem('bazfoo', serializedPayload);
        });

        it('should prepend namespace to key', function () {
          expect(source.get('foo')).to.deep.equal(payload.value);
        });
      });

      describe('when storing data', function () {
        beforeEach(function () {
          source.set('foo', payload.value);
        });

        it('should prepend namespace to key', function () {
          expect(localStorage.getItem('bazfoo')).to.equal(serializedPayload);
        });
      });
    });
  });
});
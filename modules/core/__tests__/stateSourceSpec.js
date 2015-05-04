'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var TestSource = require('./fixtures/testSource');
var describeStyles = require('../../../test/lib/describeStyles');

describe('StateSource', function () {
  var stateSource, Marty;

  beforeEach(function () {
    Marty = buildMarty();
    Marty.isASingleton = true;
  });

  describeStyles('creating a state source', function (styles) {
    var expectedResult, expectedType, expectedArg1, expectedArg2;

    beforeEach(function () {
      expectedType = 'FOO';
      expectedResult = 'foo';
      expectedArg1 = 1;
      expectedArg2 = 'gib';
      stateSource = styles({
        classic: function classic() {
          return Marty.createStateSource({
            id: 'createStateSource',
            foo: function foo() {
              return this.bar();
            },
            bar: function bar() {
              return expectedResult;
            }
          });
        },
        es6: function es6() {
          var CreateStateSource = (function (_Marty$StateSource) {
            function CreateStateSource() {
              _classCallCheck(this, CreateStateSource);

              if (_Marty$StateSource != null) {
                _Marty$StateSource.apply(this, arguments);
              }
            }

            _inherits(CreateStateSource, _Marty$StateSource);

            _createClass(CreateStateSource, [{
              key: 'foo',
              value: function foo() {
                return this.bar();
              }
            }, {
              key: 'bar',
              value: function bar() {
                return expectedResult;
              }
            }]);

            return CreateStateSource;
          })(Marty.StateSource);

          return new CreateStateSource();
        }
      });
    });

    it('should expose the function', function () {
      expect(stateSource.foo()).to.equal(expectedResult);
    });
  });

  describe('#type', function () {
    describe('when a known type', function () {
      beforeEach(function () {
        stateSource = Marty.createStateSource({
          id: 'testSource',
          type: 'testSource'
        });
      });

      it('should subclass that source', function () {
        expect(stateSource).to.be['instanceof'](TestSource);
      });
    });

    describe('when an unknown type', function () {
      it('should throw an error', function () {
        expect(creatingAStateSourceWithAnUnknownError).to['throw'](Error);

        function creatingAStateSourceWithAnUnknownError() {
          Marty.createStateSource({
            type: 'unknownSource'
          });
        }
      });
    });
  });

  describe('when you pass in an application', function () {
    var application;

    beforeEach(function () {
      Marty.isASingleton = false;

      var App = (function (_Marty$Application) {
        function App() {
          _classCallCheck(this, App);

          _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
          this.register('ss', (function (_Marty$StateSource2) {
            function SS() {
              _classCallCheck(this, SS);

              if (_Marty$StateSource2 != null) {
                _Marty$StateSource2.apply(this, arguments);
              }
            }

            _inherits(SS, _Marty$StateSource2);

            return SS;
          })(Marty.StateSource));
        }

        _inherits(App, _Marty$Application);

        return App;
      })(Marty.Application);

      application = new App();
    });

    afterEach(function () {
      Marty.isASingleton = true;
    });

    it('should be accessible on the object', function () {
      expect(application.ss.app).to.equal(application);
    });
  });

  describe('#mixins', function () {
    describe('when you have multiple mixins', function () {
      beforeEach(function () {
        stateSource = Marty.createStateSource({
          id: 'stateSourceWithMixins',
          mixins: [{
            foo: function foo() {
              return 'foo';
            }
          }, {
            bar: function bar() {
              return 'bar';
            }
          }]
        });
      });

      it('should allow you to mixin object literals', function () {
        expect(stateSource.foo()).to.equal('foo');
        expect(stateSource.bar()).to.equal('bar');
      });
    });
  });
});
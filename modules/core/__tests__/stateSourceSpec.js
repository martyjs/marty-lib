'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var TestSource = require('./fixtures/testSource');
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describe('StateSource', function () {
  var stateSource, Marty;

  beforeEach(function () {
    Marty = buildMarty();
    Marty.stateSources['testSource'] = TestSource;
  });

  describeStyles('creating a state source', function (styles) {
    var expectedResult, expectedType, expectedArg1, expectedArg2;

    beforeEach(function () {
      expectedType = 'FOO';
      expectedResult = 'foo';
      expectedArg1 = 1;
      expectedArg2 = 'gib';

      var StateSource = styles({
        classic: function classic() {
          return Marty.createStateSource({
            foo: function foo() {
              return this.bar();
            },
            bar: function bar() {
              return expectedResult;
            }
          });
        },
        es6: function es6() {
          return (function (_Marty$StateSource) {
            _inherits(CreateStateSource, _Marty$StateSource);

            function CreateStateSource() {
              _classCallCheck(this, CreateStateSource);

              _get(Object.getPrototypeOf(CreateStateSource.prototype), 'constructor', this).apply(this, arguments);
            }

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
        }
      });

      stateSource = new StateSource();
    });

    it('should expose the function', function () {
      expect(stateSource.foo()).to.equal(expectedResult);
    });
  });

  describe('#type', function () {
    describe('when a known type', function () {
      beforeEach(function () {
        var StateSource = Marty.createStateSource({
          type: 'testSource'
        });

        stateSource = new StateSource();
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
      var App = (function (_Marty$Application) {
        _inherits(App, _Marty$Application);

        function App() {
          _classCallCheck(this, App);

          _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
          this.register('ss', (function (_Marty$StateSource2) {
            _inherits(SS, _Marty$StateSource2);

            function SS() {
              _classCallCheck(this, SS);

              _get(Object.getPrototypeOf(SS.prototype), 'constructor', this).apply(this, arguments);
            }

            return SS;
          })(Marty.StateSource));
        }

        return App;
      })(Marty.Application);

      application = new App();
    });

    it('should be accessible on the object', function () {
      expect(application.ss.app).to.equal(application);
    });
  });

  describe('#mixins', function () {
    describe('when you have multiple mixins', function () {
      beforeEach(function () {
        var StateSource = Marty.createStateSource({
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

        stateSource = new StateSource();
      });

      it('should allow you to mixin object literals', function () {
        expect(stateSource.foo()).to.equal('foo');
        expect(stateSource.bar()).to.equal('bar');
      });
    });
  });
});
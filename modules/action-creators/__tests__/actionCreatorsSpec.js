'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var autoDispatch = require('../autoDispatch');
var constants = require('../../constants/constants');
var buildMarty = require('../../../test/lib/buildMarty');
var stubbedLogger = require('../../../test/lib/stubbedLogger');
var MockDispatcher = require('../../../test/lib/mockDispatcher');
var describeStyles = require('../../../test/lib/describeStyles');

describe('ActionCreators', function () {
  var actionCreators, dispatcher, actualResult, Marty;
  var expectedActionType, expectedOtherArg, expectedArg;
  var actualAction, logger;

  beforeEach(function () {
    Marty = buildMarty();
    logger = stubbedLogger();
    dispatcher = new MockDispatcher();
  });

  afterEach(function () {
    logger.restore();
  });

  describe('when you pass in an application', function () {
    var application;

    beforeEach(function () {
      var App = (function (_Marty$Application) {
        _inherits(App, _Marty$Application);

        function App() {
          _classCallCheck(this, App);

          _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
          this.register('creators', (function (_Marty$ActionCreators) {
            _inherits(AC, _Marty$ActionCreators);

            function AC() {
              _classCallCheck(this, AC);

              _get(Object.getPrototypeOf(AC.prototype), 'constructor', this).apply(this, arguments);
            }

            return AC;
          })(Marty.ActionCreators));
        }

        return App;
      })(Marty.Application);

      application = new App();
    });

    it('should be accessible on the object', function () {
      expect(application.creators.app).to.equal(application);
    });
  });

  describe('autoDispatch(constant)', function () {
    var TestConstants;
    beforeEach(function () {
      TestConstants = constants(['TEST_CONSTANT']);

      actionCreators = createActionCreators({
        testConstant: autoDispatch(TestConstants.TEST_CONSTANT)
      });
    });

    describe('when I create an action', function () {
      var expectedArguments;

      beforeEach(function () {
        expectedArguments = [1, 2, 3];
        actionCreators.testConstant.apply(actionCreators, expectedArguments);
        actualAction = dispatcher.getActionWithType('TEST_CONSTANT');
      });

      it('should dispatch an action with the constant name', function () {
        expect(actualAction).to.exist;
      });

      it('should pass through all the arguments', function () {
        expect(actualAction.arguments).to.eql(expectedArguments);
      });
    });
  });

  describe('when you create an action creator called \'dispatch\'', function () {
    it('should throw an error', function () {
      expect(createADispatchActionCreator).to['throw'](Error);

      function createADispatchActionCreator() {
        var TestConstants = constants(['DISPATCH']);

        return createActionCreators({
          dispatcher: dispatcher,
          dispatch: TestConstants.DISPATCH()
        });
      }
    });
  });

  describeStyles('when I dispatch a query', function (styles) {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedActionType = 'SOME_ACTION';
      actionCreators = styles({
        classic: function classic() {
          return createActionCreators({
            someAction: function someAction(arg) {
              this.dispatch(expectedActionType, expectedOtherArg, arg);
            }
          });
        },
        es6: function es6() {
          var TestActionCreators = (function (_Marty$ActionCreators2) {
            _inherits(TestActionCreators, _Marty$ActionCreators2);

            function TestActionCreators() {
              _classCallCheck(this, TestActionCreators);

              _get(Object.getPrototypeOf(TestActionCreators.prototype), 'constructor', this).apply(this, arguments);
            }

            _createClass(TestActionCreators, [{
              key: 'someAction',
              value: function someAction(arg) {
                this.dispatch(expectedActionType, expectedOtherArg, arg);
              }
            }]);

            return TestActionCreators;
          })(Marty.ActionCreators);

          return new TestActionCreators({
            app: {
              dispatcher: dispatcher
            }
          });
        }
      });

      actualResult = actionCreators.someAction(expectedArg);
    });

    it('should not return anything', function () {
      expect(actualResult).to.not.be.defined;
    });

    describe('#dispatch()', function () {
      beforeEach(function () {
        actualAction = dispatcher.getActionWithType(expectedActionType);
      });

      it('should dispatch the action with the given action type', function () {
        expect(actualAction).to.exist;
      });

      it('should dispatch the action with the given arguments', function () {
        expect(actualAction.arguments).to.eql([expectedOtherArg, expectedArg]);
      });
    });
  });

  describe('#mixins', function () {
    var mixin1, mixin2;

    beforeEach(function () {
      mixin1 = {
        foo: function foo() {
          return 'bar';
        }
      };

      mixin2 = {
        bar: function bar() {
          return 'baz';
        }
      };

      actionCreators = createActionCreators({
        mixins: [mixin1, mixin2]
      });
    });

    it('should allow you to mixin object literals', function () {
      expect(actionCreators.foo()).to.equal('bar');
      expect(actionCreators.bar()).to.equal('baz');
    });
  });

  function createActionCreators(options) {
    var ActionCreators = Marty.createActionCreators(options);

    return new ActionCreators({
      app: {
        dispatcher: dispatcher
      }
    });
  }
});
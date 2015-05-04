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
      class App extends Marty.Application {
        constructor() {
          super();
          this.register('creators', class AC extends Marty.ActionCreators {});
        }
      }

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
      expect(createADispatchActionCreator).to.throw(Error);

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
        classic: function () {
          return createActionCreators({
            someAction: function (arg) {
              this.dispatch(expectedActionType, expectedOtherArg, arg);
            }
          });
        },
        es6: function () {
          class TestActionCreators extends Marty.ActionCreators {
            someAction(arg) {
              this.dispatch(expectedActionType, expectedOtherArg, arg);
            }
          }

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
        foo: function () { return 'bar'; }
      };

      mixin2 = {
        bar: function () { return 'baz'; }
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

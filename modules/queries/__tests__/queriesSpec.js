'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var sinon = require('sinon');
var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var constants = require('../../constants');
var stubbedLogger = require('../../../test/lib/stubbedLogger');
var describeStyles = require('../../../test/lib/describeStyles');
var MockDispatcher = require('../../../test/lib/mockDispatcher');

describe('Queries', function () {
  var queries, dispatcher, actualResult, Marty;
  var expectedQueryType, expectedOtherArg, expectedArg;
  var actualQuery, logger;

  beforeEach(function () {
    Marty = buildMarty();
    Marty.isASingleton = true;
    logger = stubbedLogger();
    dispatcher = new MockDispatcher();
  });

  afterEach(function () {
    logger.restore();
  });

  describe('when you create a query called \'dispatch\'', function () {
    it('should throw an error', function () {
      expect(createADispatchQueries).to['throw'](Error);

      function createADispatchQueries() {
        var TestConstants = constants(['DISPATCH']);

        return Marty.createQueries({
          dispatcher: dispatcher,
          dispatch: TestConstants.DISPATCH()
        });
      }
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
          this.register('query', (function (_Marty$Queries) {
            function Queries() {
              _classCallCheck(this, Queries);

              if (_Marty$Queries != null) {
                _Marty$Queries.apply(this, arguments);
              }
            }

            _inherits(Queries, _Marty$Queries);

            return Queries;
          })(Marty.Queries));
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
      expect(application.query.app).to.equal(application);
    });
  });

  describe('resolve', function () {
    var context, queries, actualInstance, expectedInstance, query;

    beforeEach(function () {
      query = sinon.spy();
      queries = Marty.createQueries({
        id: 'foo',
        displayName: 'Bar',
        someQuery: query
      });

      context = Marty.createContext();
      actualInstance = queries['for'](context);
      expectedInstance = context.instances.Queries.foo;
    });

    it('should resolve to the actual instance', function () {
      expect(actualInstance).to.equal(expectedInstance);
    });

    it('should still expose all querys', function () {
      queries.someQuery(1);
      expect(query).to.be.calledWith(1);
    });
  });

  describeStyles('when you create a query', function (styles) {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedQueryType = 'SOME_ACTION';
      queries = styles({
        classic: function classic() {
          return Marty.createQueries({
            dispatcher: dispatcher,
            someQuery: function someQuery(arg) {
              this.dispatch(expectedQueryType, expectedOtherArg, arg);
            }
          });
        },
        es6: function es6() {
          var TestQueries = (function (_Marty$Queries2) {
            function TestQueries() {
              _classCallCheck(this, TestQueries);

              if (_Marty$Queries2 != null) {
                _Marty$Queries2.apply(this, arguments);
              }
            }

            _inherits(TestQueries, _Marty$Queries2);

            _createClass(TestQueries, [{
              key: 'someQuery',
              value: function someQuery(arg) {
                this.dispatch(expectedQueryType, expectedOtherArg, arg);
              }
            }]);

            return TestQueries;
          })(Marty.Queries);

          return new TestQueries({
            dispatcher: dispatcher
          });
        }
      });

      actualResult = queries.someQuery(expectedArg);
    });

    it('should not return anything', function () {
      expect(actualResult).to.not.be.defined;
    });

    describe('#dispatch()', function () {
      beforeEach(function () {
        actualQuery = dispatcher.getActionWithType(expectedQueryType);
      });

      it('should dispatch the query with the given query type', function () {
        expect(actualQuery).to.exist;
      });

      it('should dispatch the query with the given arguments', function () {
        expect(actualQuery.arguments).to.eql([expectedOtherArg, expectedArg]);
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

      queries = Marty.createQueries({
        dispatcher: dispatcher,
        mixins: [mixin1, mixin2]
      });
    });

    it('should allow you to mixin object literals', function () {
      expect(queries.foo()).to.equal('bar');
      expect(queries.bar()).to.equal('baz');
    });
  });
});
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var stubbedLogger = require('../../../test/lib/stubbedLogger');
var describeStyles = require('../../../test/lib/describeStyles');
var MockDispatcher = require('../../../test/lib/mockDispatcher');

describe('Queries', function () {
  var queries, dispatcher, actualResult, Marty;
  var expectedQueryType, expectedOtherArg, expectedArg;
  var actualQuery, logger;

  beforeEach(function () {
    Marty = buildMarty();
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
        var Queries = Marty.createQueries({
          dispatch: function dispatch() {
            return console.log('woop');
          }
        });

        return new Queries({
          app: {
            dispatcher: dispatcher
          }
        });
      }
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
          this.register('query', (function (_Marty$Queries) {
            _inherits(Queries, _Marty$Queries);

            function Queries() {
              _classCallCheck(this, Queries);

              _get(Object.getPrototypeOf(Queries.prototype), 'constructor', this).apply(this, arguments);
            }

            return Queries;
          })(Marty.Queries));
        }

        return App;
      })(Marty.Application);

      application = new App();
    });

    it('should be accessible on the object', function () {
      expect(application.query.app).to.equal(application);
    });
  });

  describeStyles('when you create a query', function (styles) {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedQueryType = 'SOME_ACTION';
      var Queries = styles({
        classic: function classic() {
          return Marty.createQueries({
            someQuery: function someQuery(arg) {
              this.dispatch(expectedQueryType, expectedOtherArg, arg);
            }
          });
        },
        es6: function es6() {
          return (function (_Marty$Queries2) {
            _inherits(TestQueries, _Marty$Queries2);

            function TestQueries() {
              _classCallCheck(this, TestQueries);

              _get(Object.getPrototypeOf(TestQueries.prototype), 'constructor', this).apply(this, arguments);
            }

            _createClass(TestQueries, [{
              key: 'someQuery',
              value: function someQuery(arg) {
                this.dispatch(expectedQueryType, expectedOtherArg, arg);
              }
            }]);

            return TestQueries;
          })(Marty.Queries);
        }
      });

      queries = new Queries({
        app: {
          dispatcher: dispatcher
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

      var Queries = Marty.createQueries({
        mixins: [mixin1, mixin2]
      });

      queries = new Queries({
        app: {
          dispatcher: dispatcher
        }
      });
    });

    it('should allow you to mixin object literals', function () {
      expect(queries.foo()).to.equal('bar');
      expect(queries.bar()).to.equal('baz');
    });
  });
});
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
      expect(createADispatchQueries).to.throw(Error);

      function createADispatchQueries() {
        var Queries = Marty.createQueries({
          dispatch: () => console.log('woop')
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
      class App extends Marty.Application {
        constructor() {
          super();
          this.register('query', class Queries extends Marty.Queries {});
        }
      }

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
        classic: function () {
          return Marty.createQueries({
            someQuery: function (arg) {
              this.dispatch(expectedQueryType, expectedOtherArg, arg);
            }
          });
        },
        es6: function () {
          return class TestQueries extends Marty.Queries {
            someQuery(arg) {
              this.dispatch(expectedQueryType, expectedOtherArg, arg);
            }
          };
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
        foo: function () { return 'bar'; }
      };

      mixin2 = {
        bar: function () { return 'baz'; }
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

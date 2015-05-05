var expect = require('chai').expect;
var TestSource = require('./fixtures/testSource');
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describe('StateSource', () => {
  var stateSource, Marty;

  beforeEach(() => {
    Marty = buildMarty();
    Marty.stateSources['testSource'] = TestSource;
  });

  describeStyles('creating a state source', function (styles) {
    var expectedResult, expectedType, expectedArg1, expectedArg2;

    beforeEach(() => {
      expectedType = 'FOO';
      expectedResult = 'foo';
      expectedArg1 = 1;
      expectedArg2 = 'gib';

      var StateSource = styles({
        classic: () => {
          return Marty.createStateSource({
            foo() {
              return this.bar();
            },
            bar() {
              return expectedResult;
            }
          });
        },
        es6: () => {
          return class CreateStateSource extends Marty.StateSource {
            foo() {
              return this.bar();
            }

            bar() {
              return expectedResult;
            }
          };
        }
      });

      stateSource = new StateSource();
    });

    it('should expose the function', () => {
      expect(stateSource.foo()).to.equal(expectedResult);
    });
  });

  describe('#type', () => {
    describe('when a known type', () => {
      beforeEach(() => {
        var StateSource = Marty.createStateSource({
          type: 'testSource'
        });

        stateSource = new StateSource();
      });

      it('should subclass that source', () => {
        expect(stateSource).to.be.instanceof(TestSource);
      });
    });

    describe('when an unknown type', () => {
      it('should throw an error', () => {
        expect(creatingAStateSourceWithAnUnknownError).to.throw(Error);

        function creatingAStateSourceWithAnUnknownError() {
          Marty.createStateSource({
            type: 'unknownSource'
          });
        }
      });
    });
  });

  describe('when you pass in an application', () => {
    var application;

    beforeEach(() => {
      class App extends Marty.Application {
        constructor() {
          super();
          this.register('ss', class SS extends Marty.StateSource {});
        }
      }

      application = new App();
    });

    it('should be accessible on the object', () => {
      expect(application.ss.app).to.equal(application);
    });
  });

  describe('#mixins', () => {
    describe('when you have multiple mixins', () => {
      beforeEach(() => {
        var StateSource = Marty.createStateSource({
          id: 'stateSourceWithMixins',
          mixins: [{
            foo: () => { return 'foo'; }
          }, {
            bar: () => { return 'bar'; }
          }]
        });

        stateSource = new StateSource();
      });

      it('should allow you to mixin object literals', () => {
        expect(stateSource.foo()).to.equal('foo');
        expect(stateSource.bar()).to.equal('bar');
      });
    });
  });
});
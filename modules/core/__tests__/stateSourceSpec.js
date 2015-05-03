var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var TestSource = require('./fixtures/testSource');
var describeStyles = require('../../../test/lib/describeStyles');

describe('StateSource', function () {
  var stateSource, Marty;

  beforeEach(function () {
    Marty = buildMarty();
  });

  describeStyles('creating a state source', function (styles) {
    var expectedResult, expectedType, expectedArg1, expectedArg2;

    beforeEach(function () {
      expectedType = 'FOO';
      expectedResult = 'foo';
      expectedArg1 = 1;
      expectedArg2 = 'gib';
      stateSource = styles({
        classic: function () {
          return Marty.createStateSource({
            id: 'createStateSource',
            foo: function () {
              return this.bar();
            },
            bar: function () {
              return expectedResult;
            }
          });
        },
        es6: function () {
          class CreateStateSource extends Marty.StateSource {
            foo() {
              return this.bar();
            }

            bar() {
              return expectedResult;
            }
          }

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
        expect(stateSource).to.be.instanceof(TestSource);
      });
    });

    describe('when an unknown type', function () {
      it('should throw an error', function () {
        expect(creatingAStateSourceWithAnUnknownError).to.throw(Error);

        function creatingAStateSourceWithAnUnknownError() {
          Marty.createStateSource({
            type: 'unknownSource'
          });
        }
      });
    });
  });

  describe('#mixins', function () {
    describe('when you have multiple mixins', function () {
      beforeEach(function () {
        stateSource = Marty.createStateSource({
          id: 'stateSourceWithMixins',
          mixins: [{
            foo: function () { return 'foo'; }
          }, {
            bar: function () { return 'bar'; }
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
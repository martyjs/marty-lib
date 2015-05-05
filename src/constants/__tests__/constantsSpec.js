var sinon = require('sinon');
var expect = require('chai').expect;
var warnings = require('../../core/warnings');
var buildMarty = require('../../../test/lib/buildMarty');

describe('Constants', function () {
  var input, actualResult, actionCreatorContext, Marty, constants;

  beforeEach(function () {
    Marty = buildMarty();
    constants = Marty.createConstants;
    actionCreatorContext = { dispatch: sinon.spy() };
    warnings.invokeConstant = false;
  });

  afterEach(function () {
    warnings.invokeConstant = true;
  });

  describe('when you pass in null', function () {
    it('should return an empty object literal', function () {
      expect(constants(null)).to.eql({});
    });
  });

  describe('when you pass in an array', function () {
    beforeEach(function () {
      input = ['foo', 'bar'];

      actualResult = constants(input);
    });

    it('should create an object with the given keys', function () {
      expect(Object.keys(actualResult)).to.eql(typesWithVariations(['foo', 'bar']));
    });

    it('should add a key_{STARTING} key for each key', function () {
      input.forEach(function (key) {
        expect(actualResult[key + '_STARTING']).to.equal(key + '_STARTING');
      });
    });

    it('should add a key_{FAILED} key for each key', function () {
      input.forEach(function (key) {
        expect(actualResult[key + '_FAILED']).to.equal(key + '_FAILED');
      });
    });

    it('should add a key_{DONE} key for each key', function () {
      input.forEach(function (key) {
        expect(actualResult[key + '_DONE']).to.equal(key + '_DONE');
      });
    });

    it('should create a function that equals the input string', function () {
      input.forEach(function (key) {
        expect(actualResult[key]).equal(key);
      });
    });
  });

  describe('when you pass in an object of arrays', function () {
    beforeEach(function () {
      var input = {
        foo: ['bar', 'baz'],
        bim: ['bam']
      };

      actualResult = constants(input);
    });

    it('should return an object of constants', function () {
      expect(Object.keys(actualResult)).to.eql(['foo', 'bim']);
      expect(Object.keys(actualResult.foo)).to.eql(typesWithVariations(['bar', 'baz']));
      expect(Object.keys(actualResult.bim)).to.eql(typesWithVariations(['bam']));
    });
  });

  describe('when I pass in a crazy combination of object literals and arrays', function () {
    beforeEach(function () {
      var input = {
        foo: ['bar', 'baz'],
        bim: {
          bam: ['what'],
          top: {
            flop: ['bop', 'hot']
          }
        }
      };

      actualResult = constants(input);
    });

    it('should return an object of constants', function () {
      expect(Object.keys(actualResult.bim)).to.eql(['bam', 'top']);
      expect(Object.keys(actualResult.bim.bam)).to.eql(typesWithVariations(['what']));
      expect(Object.keys(actualResult.bim.top.flop)).to.eql(typesWithVariations(['bop', 'hot']));
    });
  });

  function typesWithVariations(types) {
    var res = [];

    types.forEach(function (type) {
      res.push(type);
      res.push(type + '_STARTING');
      res.push(type + '_DONE');
      res.push(type + '_FAILED');
    });

    return res;
  }
});
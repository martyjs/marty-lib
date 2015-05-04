var expect = require('chai').expect;
var warnings = require('../warnings');
var buildMarty = require('./buildMarty');

describe('Marty.isASingleton', () => {
  var Marty;

  beforeEach(() => {
    Marty = buildMarty();
  });

  describe('when marty is a singleton', () => {
    beforeEach(() => {
      Marty.isASingleton = true;
    });

    it('should return an instance of the constructor you passed in', () => {
      expect(Marty.register(Marty.StateSource)).to.be.instanceof(Marty.StateSource);
    });
  });

  describe('when marty is not a singleton', () => {
    beforeEach(() => {
      Marty.isASingleton = false;
    });

    afterEach(() => {
      Marty.isASingleton = true;
    });

    it('should return the original type', () => {
      expect(Marty.register(Marty.StateSource)).to.equal(Marty.StateSource);
    });
  });
});
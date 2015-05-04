'use strict';

var expect = require('chai').expect;
var warnings = require('../warnings');
var buildMarty = require('./buildMarty');

describe('Marty.isASingleton', function () {
  var Marty;

  beforeEach(function () {
    Marty = buildMarty();
  });

  describe('when marty is a singleton', function () {
    beforeEach(function () {
      Marty.isASingleton = true;
    });

    it('should return an instance of the constructor you passed in', function () {
      expect(Marty.register(Marty.StateSource)).to.be['instanceof'](Marty.StateSource);
    });
  });

  describe('when marty is not a singleton', function () {
    beforeEach(function () {
      Marty.isASingleton = false;
    });

    afterEach(function () {
      Marty.isASingleton = true;
    });

    it('should return the original type', function () {
      expect(Marty.register(Marty.StateSource)).to.equal(Marty.StateSource);
    });
  });
});
'use strict';

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var DispatchCoordinator = require('../dispatchCoordinator');

describe('DispatchCoordinator', function () {
  var Marty, coordinator;

  beforeEach(function () {
    Marty = buildMarty();
    coordinator = new DispatchCoordinator('Test', {});
  });

  describe('when you try to dispatch something without a type', function () {
    it('should throw an error', function () {
      expect(dispatchingWithoutAType).to['throw'](Error);

      function dispatchingWithoutAType() {
        coordinator.dispatch(null, 'foo');
      }
    });
  });
});
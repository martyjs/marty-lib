'use strict';

var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

describe('Marty#createApplication()', function () {
  var Marty, application;

  beforeEach(function () {
    Marty = buildMarty();

    var App = Marty.createApplication(function () {
      this.register('foo', Marty.Store);
      this.register('bar', Marty.Store);
    });

    application = new App();
  });

  it('should behave the same as with a class', function () {
    expect(application.foo).to.be['instanceof'](Marty.Store);
  });
});
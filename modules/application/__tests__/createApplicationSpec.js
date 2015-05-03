var _ = require('lodash');
var sinon = require('sinon');
var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('./buildMarty');

describe('Marty#createApplication()', () => {
  var Marty, application;

  beforeEach(() => {
    Marty = buildMarty();

    var App = Marty.createApplication(function () {
      this.register('foo', Marty.Store);
      this.register('bar', Marty.Store);
    });

    application = new App();
  });

  it('should behave the same as with a class', () => {
    expect(application.foo).to.be.instanceof(Marty.Store);
  });
});
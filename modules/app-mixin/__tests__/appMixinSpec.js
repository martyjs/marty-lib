'use strict';

var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

describe('Marty.createAppMixin()', function () {
  var actualApp, Marty, app;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();

    var Component = React.createClass({
      displayName: 'Component',

      mixins: [Marty.createAppMixin()],
      render: function render() {
        actualApp = this.app;
        return false;
      },
      getInitialState: function getInitialState() {
        return {};
      }
    });

    renderIntoDocument(React.createElement(Component, { app: app }));
  });

  it('should expose the app', function () {
    expect(actualApp).to.eql(app);
  });
});
'use strict';

var React = require('react');

var _require = require('lodash');

var each = _require.each;

var _require2 = require('chai');

var expect = _require2.expect;

var buildMarty = require('../../../test/lib/buildMarty');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

describe('ApplicationContainer', function () {
  var Marty = undefined,
      ApplicationContainer = undefined,
      actualProps = undefined,
      actualApp = undefined,
      app = undefined;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();
    ApplicationContainer = Marty.ApplicationContainer;
  });

  describe('when you have a single child', function () {
    beforeEach(function () {
      var Foo = React.createClass({
        displayName: 'Foo',

        mixins: [Marty.createAppMixin()],
        render: function render() {
          actualApp = this.app;
          return false;
        }
      });

      var Bar = React.createClass({
        displayName: 'Bar',

        render: function render() {
          actualProps = this.props;
          return React.createElement(Foo, null);
        }
      });

      renderIntoDocument(React.createElement(
        ApplicationContainer,
        { app: app },
        React.createElement(Bar, null)
      ));
    });

    it('should pass the app in via the props', function () {
      expect(actualProps.app).to.equal(app);
    });

    it('should make the app available in the context', function () {
      expect(actualApp).to.equal(app);
    });
  });

  describe('when you have multiple children', function () {
    var fooApp = undefined,
        barApp = undefined;
    beforeEach(function () {
      var Foo = React.createClass({
        displayName: 'Foo',

        mixins: [Marty.createAppMixin()],
        render: function render() {
          fooApp = this.app;
          return false;
        }
      });

      var Bar = React.createClass({
        displayName: 'Bar',

        mixins: [Marty.createAppMixin()],
        render: function render() {
          barApp = this.app;
          return false;
        }
      });

      app = new Marty.Application();

      renderIntoDocument(React.createElement(
        ApplicationContainer,
        { app: app },
        React.createElement(Foo, null),
        React.createElement(Bar, null)
      ));
    });

    it('should pass the app to all of them', function () {
      each([fooApp, barApp], function (actualApp) {
        return expect(actualApp).to.equal(app);
      });
    });
  });
});
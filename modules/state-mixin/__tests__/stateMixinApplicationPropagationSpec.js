'use strict';

var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

describe('State Mixin application Propagation', function () {
  var Marty, app;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();
  });

  describe('when I have a container component', function () {
    var childApp = undefined;

    beforeEach(function () {
      var Child = React.createClass({
        displayName: 'Child',

        mixins: [Marty.createStateMixin()],
        render: function render() {
          return false;
        },
        getInitialState: function getInitialState() {
          childApp = this.app;

          return {};
        }
      });

      var Parent = React.createClass({
        displayName: 'Parent',

        mixins: [Marty.createStateMixin()],
        render: function render() {
          return React.createElement(Child, null);
        }
      });

      renderIntoDocument(React.createElement(Parent, { app: app }));
    });

    it('should pass the component to any children', function () {
      expect(childApp).to.equal(app);
    });
  });
});
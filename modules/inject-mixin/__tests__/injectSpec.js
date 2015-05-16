'use strict';

var _ = require('lodash');
var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

describe('Marty.inject()', function () {
  var functionContext, Marty, app;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();

    app.register('fooStore', Marty.Store);
    app.register('foo.barStore', Marty.Store);
    app.register('barActions', Marty.ActionCreators);

    var Component = app.bindTo(React.createClass({
      mixins: [Marty.inject('fooStore', 'barActions', 'foo.barStore')],
      render: function render() {
        functionContext = this;
        return false;
      },
      getInitialState: function getInitialState() {
        return {};
      }
    }));

    renderIntoDocument(React.createElement(Component, null));
  });

  it('should inject in the given dependencies', function () {
    expect(deps(functionContext)).to.eql(deps(app));
  });

  function deps(obj) {
    return _.pick(obj, 'fooStore', 'barActions', 'foo');
  }
});
var _ = require('lodash');
var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var { renderIntoDocument } = require('react/addons').addons.TestUtils;

describe('Marty.inject()', function () {
  var functionContext, Marty, app;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();

    app.register('fooStore', Marty.Store);
    app.register('foo.barStore', Marty.Store);
    app.register('barActions', Marty.ActionCreators);

    var Component = React.createClass({
      mixins: [Marty.inject(
        'fooStore',
        'barActions',
        'foo.barStore'
      )],
      render() {
        functionContext = this;
        return false;
      },
      getInitialState() {
        return {};
      }
    });

    renderIntoDocument(<Component app={app} />);
  });

  it('should inject in the given dependencies', () => {
    expect(deps(functionContext)).to.eql(deps(app));
  });

  function deps(obj) {
    return _.pick(obj, 'fooStore', 'barActions', 'foo');
  }
});
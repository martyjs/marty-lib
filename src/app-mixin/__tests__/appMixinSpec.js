var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var { renderIntoDocument } = require('react/addons').addons.TestUtils;

describe('Marty.createAppMixin()', function () {
  var actualApp, Marty, app;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();

    var Component = React.createClass({
      mixins: [Marty.createAppMixin()],
      render() {
        actualApp = this.app;
        return false;
      },
      getInitialState() {
        return {};
      }
    });

    renderIntoDocument(<Component app={app} />);
  });

  it('should expose the app', () => {
    expect(actualApp).to.eql(app);
  });
});
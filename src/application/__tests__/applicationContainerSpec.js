let React = require('react');
let { each } = require('lodash');
let { expect } = require('chai');
let buildMarty = require('../../../test/lib/buildMarty');
var { renderIntoDocument } = require('react/addons').addons.TestUtils;

describe('ApplicationContainer', () => {
  let Marty, ApplicationContainer, actualProps, actualApp, app;

  beforeEach(() => {
    Marty = buildMarty();
    app = new Marty.Application();
    ApplicationContainer = Marty.ApplicationContainer;
  });

  describe('when you have a single child', () => {
    beforeEach(() => {
      let Foo = React.createClass({
        mixins: [Marty.createAppMixin()],
        render() {
          actualApp = this.app;
          return false;
        }
      });

      let Bar = React.createClass({
        render() {
          actualProps = this.props;
          return <Foo />;
        }
      });

      renderIntoDocument((
        <ApplicationContainer app={app}>
          <Bar />
        </ApplicationContainer>
      ));
    });

    it('should pass the app in via the props', () => {
      expect(actualProps.app).to.equal(app);
    });

    it('should make the app available in the context', () => {
      expect(actualApp).to.equal(app);
    });
  });

  describe('when you have multiple children', () => {
    let fooApp, barApp;
    beforeEach(() => {
      let Foo = React.createClass({
        mixins: [Marty.createAppMixin()],
        render() {
          fooApp = this.app;
          return false;
        }
      });

      let Bar = React.createClass({
        mixins: [Marty.createAppMixin()],
        render() {
          barApp = this.app;
          return false;
        }
      });

      app = new Marty.Application();

      renderIntoDocument((
        <ApplicationContainer app={app}>
          <Foo />
          <Bar />
        </ApplicationContainer>
      ));
    });

    it('should pass the app to all of them', () => {
      each([fooApp, barApp], actualApp => expect(actualApp).to.equal(app));
    });
  });
});
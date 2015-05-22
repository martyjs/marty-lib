var invariant = require('invariant');
var { isArray } = require('../mindash');

module.exports = function (React) {
  var ApplicationContainer = React.createClass({
    childContextTypes: {
      app: React.PropTypes.object
    },
    propTypes: {
      app: React.PropTypes.object
    },
    getChildContext() {
      invariant(this.props.app, 'Must specify the application');

      return {
        app: this.props.app
      };
    },
    render() {
      let { app, children } = this.props;

      if (children) {
        if (isArray(children)) {
          return React.Children.map(children, cloneElementWithApp);
        } else {
          return cloneElementWithApp(children);
        }
      }

      function cloneElementWithApp(element) {
        return React.addons.cloneWithProps(element, {
          app: app
        });
      }
    }
  });

  return ApplicationContainer;
};
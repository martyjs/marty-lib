var invariant = require('invariant');

module.exports = function (React) {
  return React.createClass({
    propTypes: {
      app: React.PropTypes.object.isRequired
    },
    childContextTypes: {
      app: React.PropTypes.object
    },
    getChildContext() {
      invariant(this.props.app, 'Must specify the application');

      return {
        app: this.props.app
      };
    },
    getInnerComponent() {
      return this.refs.innerComponent;
    },
    render() {
      return React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, {
          app: this.props.app
        });
      });
    }
  });
};
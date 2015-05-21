var invariant = require('invariant');
var { isArray } = require('../mindash');

module.exports = function (React) {
  return React.createClass({
    contextTypes: {
      app: React.PropTypes.object
    },
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
    getInnerComponent() {
      return this.refs.innerComponent;
    },
    render() {
      let { app, children } = this.props;

      if (children) {
        if (isArray(children)) {
          return <span>{React.Children.map(children, cloneElementWithApp)}</span>;
        } else {
          return cloneElementWithApp(children);
        }  
      }

      function cloneElementWithApp(element) {
        return React.cloneElement(element, {
          app: app
        });
      }
    }
  });
};
'use strict';

var invariant = require('invariant');

module.exports = function (React) {
  return React.createClass({
    propTypes: {
      app: React.PropTypes.object.isRequired
    },
    childContextTypes: {
      app: React.PropTypes.object
    },
    getChildContext: function getChildContext() {
      invariant(this.props.app, 'Must specify the application');

      return {
        app: this.props.app
      };
    },
    getInnerComponent: function getInnerComponent() {
      return this.refs.innerComponent;
    },
    render: function render() {
      var _this = this;

      return React.Children.map(this.props.children, function (child) {
        return React.cloneElement(child, {
          app: _this.props.app
        });
      });
    }
  });
};
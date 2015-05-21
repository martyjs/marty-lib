'use strict';

var invariant = require('invariant');

var _require = require('../mindash');

var isArray = _require.isArray;

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
      var _props = this.props;
      var app = _props.app;
      var children = _props.children;

      if (children) {
        if (isArray(children)) {
          return React.createElement(
            'span',
            null,
            React.Children.map(children, cloneElementWithApp)
          );
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
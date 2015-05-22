'use strict';

var invariant = require('invariant');

var _require = require('../mindash');

var isArray = _require.isArray;

module.exports = function (React) {
  var ApplicationContainer = React.createClass({
    displayName: 'ApplicationContainer',

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
    render: function render() {
      var _props = this.props;
      var app = _props.app;
      var children = _props.children;

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
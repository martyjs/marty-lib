'use strict';

var _require = require('../mindash');

var isArray = _require.isArray;

var findApp = require('../core/findApp');

module.exports = function (React) {
  var ApplicationContainer = React.createClass({
    displayName: 'ApplicationContainer',

    childContextTypes: {
      app: React.PropTypes.object
    },
    getChildContext: function getChildContext() {
      return { app: findApp(this) };
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
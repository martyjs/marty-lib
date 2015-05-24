'use strict';

var findApp = require('../core/findApp');

var _require = require('../mindash');

var isArray = _require.isArray;
var extend = _require.extend;

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
          return React.createElement(
            'span',
            null,
            React.Children.map(children, cloneWithApp)
          );
        } else {
          return cloneWithApp(children);
        }
      }

      function cloneWithApp(element) {
        return React.createElement(element.type, extend({
          app: app
        }, element.props));
      }
    }
  });

  return ApplicationContainer;
};
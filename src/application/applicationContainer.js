let { isArray } = require('../mindash');
let findApp = require('../core/findApp');

module.exports = function (React) {
  let ApplicationContainer = React.createClass({
    childContextTypes: {
      app: React.PropTypes.object
    },
    getChildContext() {
      return { app: findApp(this) };
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
        return React.addons.cloneWithProps(element, {
          app: app
        });
      }
    }
  });

  return ApplicationContainer;
};
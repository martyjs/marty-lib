let findApp = require('../core/findApp');
let appProperty = require('../core/appProperty');

module.exports = function (React) {
  return function (/*...dependencies*/) {
    let contextTypes = {
      app: React.PropTypes.object
    };

    return {
      contextTypes: contextTypes,
      childContextTypes: contextTypes,
      getChildContext() {
        return { app: findApp(this) };
      },
      getInitialState: function () {
        appProperty(this);

        return {};
      }
    };
  };
};
let _ = require('../mindash');
let inject = require('../core/inject');
let findApp = require('../core/findApp');

module.exports = function (React) {
  return function (/*...dependencies*/) {
    let options = {
      inject: _.toArray(arguments)
    };

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
        inject(this, options);

        return {};
      }
    };
  };
};
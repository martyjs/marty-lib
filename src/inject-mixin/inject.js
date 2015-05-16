let _ = require('../mindash');
let injectDependencies = require('../core/inject');

module.exports = function (React) {
  return function inject(/*...dependencies*/) {
    let dependencies = _.toArray(arguments);

    return {
      contextTypes: {
        app: React.PropTypes.object
      },
      getInitialState: function () {
        injectDependencies(this, {
          inject: dependencies
        });

        return {};
      }
    };
  };
};
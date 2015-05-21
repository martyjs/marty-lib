let _ = require('../mindash');
let inject = require('../core/inject');

module.exports = function (React) {
  return function (/*...dependencies*/) {
    let options = {
      inject: _.toArray(arguments)
    };

    return {
      contextTypes: {
        app: React.PropTypes.object
      },
      getInitialState: function () {
        inject(this, options);

        return {};
      }
    };
  };
};
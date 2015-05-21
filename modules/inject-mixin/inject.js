'use strict';

var _ = require('../mindash');
var inject = require('../core/inject');

module.exports = function (React) {
  return function () {
    var options = {
      inject: _.toArray(arguments)
    };

    return {
      contextTypes: {
        app: React.PropTypes.object
      },
      getInitialState: function getInitialState() {
        inject(this, options);

        return {};
      }
    };
  };
};
/*...dependencies*/
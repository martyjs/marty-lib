'use strict';

var _ = require('../mindash');
var injectDependencies = require('../core/inject');

module.exports = function (React) {
  return function inject() {
    var dependencies = _.toArray(arguments);

    return {
      contextTypes: {
        app: React.PropTypes.object
      },
      getInitialState: function getInitialState() {
        injectDependencies(this, {
          inject: dependencies
        });

        return {};
      }
    };
  };
};
/*...dependencies*/
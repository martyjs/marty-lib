let _ = require('lodash');

function inject(obj, options) {
  let listenTo = _.isArray(options.listenTo) ? options.listenTo : [options.listenTo];
  let dependencies = _.union(options.inject, listenTo);

  _.each(dependencies, dependency => {
    Object.defineProperty(obj, dependency, {
      get() {
        return this.context.app[dependency];
      }
    });
  });
}

module.exports = inject;
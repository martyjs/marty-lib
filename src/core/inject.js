let invariant = require('invariant');
let {
  each,
  isArray,
  isString,
  union,
  map,
  filter
} = require('../mindash');

function inject(obj, options) {
  let dependencies = union(
    toArray(options.inject || []),
    toArray(options.listenTo || [])
  );

  dependencies = map(filter(dependencies, undefinedValues), topLevelDependency);

  each(dependencies, dependency => {
    Object.defineProperty(obj, dependency, {
      get() {
        return this.context.app[dependency];
      }
    });
  });
}

function toArray(obj) {
  return isArray(obj) ? obj : [obj];
}

function undefinedValues(dependency) {
  return dependency;
}

function topLevelDependency(dependency) {
  invariant(isString(dependency), 'Dependency Id must be a string');

  return dependency.split('.')[0];
}

module.exports = inject;
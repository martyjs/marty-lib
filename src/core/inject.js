let findApp = require('./findApp');
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
  get('app', function () {
    return findApp(this);
  });

  let dependencies = union(
    toArray(options.inject || []),
    toArray(options.listenTo || [])
  );

  dependencies = map(filter(dependencies, undefinedValues), topLevelDependency);

  each(dependencies, dependency => {
    get(dependency, function () {
      return this.app[dependency];
    });
  });

  function get(name, getter) {
    if (!obj.hasOwnProperty(name)) {
      Object.defineProperty(obj, name, {
        get: getter
      });
    }
  }
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
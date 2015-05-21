'use strict';

var findApp = require('./findApp');
var invariant = require('invariant');

var _require = require('../mindash');

var each = _require.each;
var isArray = _require.isArray;
var isString = _require.isString;
var union = _require.union;
var map = _require.map;
var filter = _require.filter;

function inject(obj, options) {
  Object.defineProperty(obj, 'app', {
    get: function get() {
      return findApp(this);
    }
  });

  var dependencies = union(toArray(options.inject || []), toArray(options.listenTo || []));

  dependencies = map(filter(dependencies, undefinedValues), topLevelDependency);

  each(dependencies, function (dependency) {
    Object.defineProperty(obj, dependency, {
      get: function get() {
        return this.app[dependency];
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
'use strict';

var Queries = require('./queries');
var _ = require('../mindash');
var createClass = require('../core/createClass');

var RESERVED_KEYWORDS = ['dispatch'];

function createQueriesClass(properties) {
  properties = properties || {};
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error(keyword + ' is a reserved keyword');
    }
  });

  var classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, Queries);
}

module.exports = createQueriesClass;
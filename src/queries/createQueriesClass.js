let Queries = require('./queries');
let _ = require('../mindash');
let createClass = require('../core/createClass');

let RESERVED_KEYWORDS = ['dispatch'];

function createQueriesClass(properties) {
  properties = properties || {};
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error(`${keyword} is a reserved keyword`);
    }
  });

  let classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, Queries);
}

module.exports = createQueriesClass;
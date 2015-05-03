var _ = require('marty-core')._;
var createClass = require('marty-core').createClass;
var ActionCreators = require('./actionCreators');
var RESERVED_KEYWORDS = ['dispatch'];

function createActionCreatorsClass(properties) {
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error(`${keyword} is a reserved keyword`);
    }
  });

  var classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, ActionCreators);
}

module.exports = createActionCreatorsClass;
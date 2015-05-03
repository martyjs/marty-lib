var _ = require('../../mindash');
var createClass = require('../createClass');

function createStateSourceClass(properties, baseType) {
  properties = properties || {};

  var merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType);
}

module.exports = createStateSourceClass;
let _ = require('../../mindash');
let createClass = require('../createClass');

function createStateSourceClass(properties, baseType) {
  properties = properties || {};

  let merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType);
}

module.exports = createStateSourceClass;
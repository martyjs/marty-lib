let _ = require('../mindash');
let logger = require('./logger');
let warnings = require('./warnings');
let diagnostics = require('./diagnostics');
let environment = require('./environment');
let StateSource = require('./stateSource');
let createStateSourceClass = require('./stateSource/createStateSourceClass');

module.exports = function (marty) {
  marty.registerClass('StateSource', StateSource);

  marty.register('logger', logger);
  marty.register('warnings', warnings);
  marty.register('diagnostics', diagnostics);
  marty.register('createStateSource', createStateSource);

  _.each(environment, function (value, key) {
    marty.register(key, value);
  });

  function createStateSource(properties) {
    properties = properties || {};

    let BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    return createStateSourceClass(properties, BaseType);
  }
};
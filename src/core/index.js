let _ = require('../mindash');
let logger = require('./logger');
let warnings = require('./warnings');
let diagnostics = require('./diagnostics');
let environment = require('./environment');
let StateSource = require('./stateSource');
let createStateSourceClass = require('./stateSource/createStateSourceClass');

module.exports = function (marty) {
  marty.logger = logger;
  marty.warnings = warnings;
  marty.diagnostics = diagnostics;
  marty.StateSource = StateSource;
  marty.createStateSource = createStateSource;

  _.extend(marty, environment);

  function createStateSource(properties) {
    properties = properties || {};

    let BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    return createStateSourceClass(properties, BaseType);
  }
};
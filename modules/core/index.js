'use strict';

var _ = require('../mindash');
var logger = require('./logger');
var warnings = require('./warnings');
var diagnostics = require('./diagnostics');
var environment = require('./environment');
var StateSource = require('./stateSource');
var createStateSourceClass = require('./stateSource/createStateSourceClass');

module.exports = function (marty) {
  marty.logger = logger;
  marty.warnings = warnings;
  marty.diagnostics = diagnostics;
  marty.StateSource = StateSource;
  marty.createStateSource = createStateSource;

  _.extend(marty, environment);

  function createStateSource(properties) {
    properties = properties || {};

    var BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    return createStateSourceClass(properties, BaseType);
  }
};
var _ = require('./lib/mindash');
var logger = require('./lib/logger');
var warnings = require('./lib/warnings');
var diagnostics = require('./lib/diagnostics');
var environment = require('./lib/environment');
var StateSource = require('./lib/stateSource');
var getClassName = require('./lib/utils/getClassName');
var createStateSourceClass = require('./lib/stateSource/createStateSourceClass');

module.exports = function (marty) {
  marty.registerClass('StateSource', StateSource);

  marty.register('logger', logger);
  marty.register('dispose', dispose);
  marty.register('warnings', warnings);
  marty.register('register', register);
  marty.register('diagnostics', diagnostics);
  marty.register('createStateSource', createStateSource);

  marty.registerProperty('isASingleton', {
    get() {
      return !!this.__isASingleton;
    },
    set(value) {
      if (this.warnings.martyIsASingleton) {
        logger.warn(
          'Warning: Marty will no longer be a singleton in future releases ' +
          'http://martyjs.org/guides/marty-is-a-singelton.html'
        ).

        this.__isASingleton = value;
      }
    }
  });

  _.each(environment, function (value, key) {
    marty.register(key, value);
  });

  function dispose() {
    this.registry.dispose();
    this.dispatcher.dispose();
  }

  function createStateSource(properties) {
    var BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    var StateSourceClass = createStateSourceClass(properties, BaseType);
    var defaultInstance = this.register(StateSourceClass);

    return defaultInstance;
  }

  function register(clazz, id) {
    var className = getClassName(clazz);

    if (!clazz.id) {
      clazz.id = id || className;
    }

    if (!clazz.displayName) {
      clazz.displayName = clazz.id;
    }

    return this.registry.register(clazz);
  }
};

_.extend(module.exports, require('./lib'));
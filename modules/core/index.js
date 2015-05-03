var _ = require('../mindash');
var logger = require('./logger');
var warnings = require('./warnings');
var diagnostics = require('./diagnostics');
var environment = require('./environment');
var StateSource = require('./stateSource');
var getClassName = require('./utils/getClassName');
var createStateSourceClass = require('./stateSource/createStateSourceClass');

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
      // if (warnings.appIsTheFuture) {
      //   logger.warn(
      //     'Warning: Marty will no longer be a singleton in future releases. ' +
      //     'Please use applications instead. ' +
      //     'http://martyjs.org/depreciated/singelton.html'
      //   );
      // }

      this.__isASingleton = value;
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
    if (!this.isASingleton) {
      return clazz;
    }

    // if (warnings.appIsTheFuture) {
    //   logger.warn(
    //     'Warning: Marty will no longer be a singleton in future releases. ' +
    //     'Please use applications instead of registering in the global object. ' +
    //     'http://martyjs.org/depreciated/singelton.html'
    //   );
    // }

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
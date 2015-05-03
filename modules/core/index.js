let _ = require('../mindash');
let logger = require('./logger');
let warnings = require('./warnings');
let diagnostics = require('./diagnostics');
let environment = require('./environment');
let StateSource = require('./stateSource');
let getClassName = require('./utils/getClassName');
let createStateSourceClass = require('./stateSource/createStateSourceClass');

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
    let BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    let StateSourceClass = createStateSourceClass(properties, BaseType);
    let defaultInstance = this.register(StateSourceClass);

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

    let className = getClassName(clazz);

    if (!clazz.id) {
      clazz.id = id || className;
    }

    if (!clazz.displayName) {
      clazz.displayName = clazz.id;
    }

    return this.registry.register(clazz);
  }
};
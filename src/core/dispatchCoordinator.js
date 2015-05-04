let log = require('./logger');
let uuid = require('./utils/uuid');
let warnings = require('./warnings');
let Environment = require('./environment');

class DispatchCoordinator {
  constructor(type, options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    options = options || {};

    this.__type = type;
    this.__isCoreType = true;
    this.__app = options.app;
    this.__id = uuid.type(this.__type);
  }

  dispatch(type, ...args) {
    return this.app.dispatcher.dispatchAction({
      type: type,
      arguments: args
    });
  }

  get app() {
    return this.__app;
  }
}

module.exports = DispatchCoordinator;
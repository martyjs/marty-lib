let log = require('./logger');
let uuid = require('./utils/uuid');
let warnings = require('./warnings');
let resolve = require('./utils/resolve');
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
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
    this.__dispatcher = options.dispatcher;
  }

  dispatch(type, ...args) {
    return this.__dispatcher.dispatchAction({
      type: type,
      arguments: args
    });
  }

  for (obj) {
    return resolve(this, obj);
  }

  get app() {
    return this.__app;
  }

  get context() {
    return this.__context;
  }
}

module.exports = DispatchCoordinator;
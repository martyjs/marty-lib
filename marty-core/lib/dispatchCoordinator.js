var log = require('./logger');
var uuid = require('./utils/uuid');
var warnings = require('./warnings');
var resolve = require('./utils/resolve');
var Environment = require('./environment');

class DispatchCoordinator {
  constructor(type, options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    options = options || {};

    this.__type = type;
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

  get context() {
    return this.__context;
  }
}

module.exports = DispatchCoordinator;
var log = require('../logger');
var uuid = require('../utils/uuid');
var warnings = require('../warnings');
var resolve = require('../utils/resolve');
var Environment = require('../environment');

class StateSource {
  constructor(options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__isCoreType = true;
    this.__type = 'StateSource';
    this.__app = options.app;
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
  }

  get context() {
    return this.__context;
  }

  get app() {
    return this.__app;
  }

  for (obj) {
    return resolve(this, obj);
  }

  dispose() {
  }
}

module.exports = StateSource;
let log = require('../logger');
let uuid = require('../utils/uuid');
let warnings = require('../warnings');
let Environment = require('../environment');

class StateSource {
  constructor(options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__isCoreType = true;
    this.__type = 'StateSource';
    this.__app = options.app;
    this.__id = uuid.type(this.__type);
  }

  get app() {
    return this.__app;
  }

  dispose() {
  }
}

module.exports = StateSource;
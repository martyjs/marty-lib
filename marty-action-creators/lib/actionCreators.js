var DispatchCoordinator = require('marty-core').DispatchCoordinator;

class ActionCreators extends DispatchCoordinator {
  constructor(options) {
    super('ActionCreators', options);
  }
}

module.exports = ActionCreators;

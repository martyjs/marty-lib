var DispatchCoordinator = require('../../core/dispatchCoordinator');

class ActionCreators extends DispatchCoordinator {
  constructor(options) {
    super('ActionCreators', options);
  }
}

module.exports = ActionCreators;

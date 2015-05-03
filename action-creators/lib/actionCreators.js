var DispatchCoordinator = require('../../core/lib/dispatchCoordinator');

class ActionCreators extends DispatchCoordinator {
  constructor(options) {
    super('ActionCreators', options);
  }
}

module.exports = ActionCreators;

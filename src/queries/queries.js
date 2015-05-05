let DispatchCoordinator = require('../core/dispatchCoordinator');

class Queries extends DispatchCoordinator {
  constructor(options) {
    super('Queries', options);
  }
}

module.exports = Queries;
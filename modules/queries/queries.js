var DispatchCoordinator = require('../core/DispatchCoordinator')

class Queries extends DispatchCoordinator {
  constructor(options) {
    super('Queries', options);
  }
}

module.exports = Queries;
let _ = require('../mindash');

class Marty {
  constructor(version, react) {
    this.version = version;
    this.stateSources = {};

    this.use = function use(cb) {
      if (!_.isFunction(cb)) {
        throw new Error('Must pass in a function');
      }

      cb(this, react);
    };
  }
}

module.exports = Marty;
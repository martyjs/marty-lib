let _ = require('../mindash');
let MartyBuilder = require('./martyBuilder');

class Marty {
  constructor(version, react) {
    let builder = new MartyBuilder(this);

    this.version = version;

    this.use = function use(cb) {
      if (!_.isFunction(cb)) {
        throw new Error('Must pass in a function');
      }

      cb(builder, react);
    };
  }
}

module.exports = Marty;
var _ = require('./mindash');
var Registry = require('./registry');
var MartyBuilder = require('./martyBuilder');
var createDispatcher = require('./createDispatcher');

class Marty {
  constructor(version, react) {
    var builder = new MartyBuilder(this);

    this.version = version;
    this.dispatcher = createDispatcher();
    this.registry = new Registry({
      defaultDispatcher: this.dispatcher
    });

    this.use = function use(cb) {
      if (!_.isFunction(cb)) {
        throw new Error('Must pass in a function');
      }

      cb(builder, react);
    };
  }
}

module.exports = Marty;
let _ = require('../mindash');
let Registry = require('./registry');
let MartyBuilder = require('./martyBuilder');
let createDispatcher = require('./createDispatcher');

class Marty {
  constructor(version, react) {
    let dispatcher = createDispatcher();
    let builder = new MartyBuilder(this);
    let registry = new Registry({
      defaultDispatcher: dispatcher
    });

    this.version = version;
    Object.defineProperty(this, 'registry', {
      get() {
        return registry;
      }
    });

    Object.defineProperty(this, 'dispatcher', {
      get() {
        if (this.warnings && this.warnings.appIsTheFuture) {
          this.logger.warn(
            'Warning: The global dispatcher is being depreciated. ' +
            'Please move to using application\'s instead. ' +
            'http://martyjs.org/depreciated/singelton.html'
          );
        }

        return dispatcher;
      }
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
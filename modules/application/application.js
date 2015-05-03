var _ = require('../mindash');
var timeout = require('../core/utils/timeout');
var deferred = require('../core/utils/deferred');
var createDispatcher = require('../core/createDispatcher');
var FetchDiagnostics = require('../isomorphism/fetchDiagnostics');

var DEFAULT_TIMEOUT = 1000;

module.exports = function (React) {
  class Application {
    constructor() {
      var dispatcher = createDispatcher();

      // Needed because we don't have access to actual Application type
      this.__isApplication = true;
      this.__isCoreType = true;
      this.__types = {};

      Object.defineProperty(this, 'dispatcher', {
        get: function () {
          return dispatcher;
        }
      });
    }

    bindTo(InnerComponent) {
      var app = this;

      if (!InnerComponent) {
        throw new Error('Must specify an inner component');
      }

      return React.createClass({
        childContextTypes: {
          app: React.PropTypes.object
        },
        getChildContext() {
          return { app: app };
        },
        render() {
          return <InnerComponent {...this.props} />;
        }
      });
    }

    getAll(type) {
      return this.__types[type] || {};
    }

    register(key, Constructor) {
      if (!this.dispatcher) {
        throw new Error('`super()` must be called before you can register anything');
      }

      if (!key) {
        throw new Error('Must specify a key or an object');
      }

      if (_.isString(key)) {
        if (!_.isFunction(Constructor)) {
          throw new Error('Must pass in a instantiable object');
        }

        var obj = new Constructor({
          app: this
        });

        var type = obj.__type;

        if (type) {
          if (!this.__types[type]) {
            this.__types[type] = {};
          }

          this.__types[type][key] = obj;
        }

        this[key] = obj;
      }

      if (_.isObject(key)) {
        _.each(key, (Constructor, key) => {
          if (_.isFunction(Constructor)) {
            this.register(key, Constructor)
          } else {
            throw new Error('Cannot pass in complex objects for registration at the moment.');
          }
        });
      }
    }

    fetch(cb, options) {
      var fetchFinished;

      options = _.defaults(options || {}, {
        timeout: DEFAULT_TIMEOUT
      });

      this.__deferredFetchFinished = deferred();
      this.__diagnostics = new FetchDiagnostics();
      fetchFinished = this.__deferredFetchFinished.promise;

      try {
        cb.call(this);
      } catch (e) {
        this.__deferredFetchFinished.reject(e);

        return fetchFinished;
      }

      if (!this.__diagnostics.hasPendingFetches) {
        this.__deferredFetchFinished.resolve();
      }

      return Promise
        .race([fetchFinished, timeout(options.timeout)])
        .then(() => this.__diagnostics.toJSON());
    }

    fetchStarted(storeId, fetchId) {
      var diagnostics = this.__diagnostics;

      diagnostics.fetchStarted(storeId, fetchId);
    }

    fetchFinished(storeId, fetchId, status, options) {
      var diagnostics = this.__diagnostics;

      diagnostics.fetchFinished(storeId, fetchId, status, options);

      if (!diagnostics.hasPendingFetches) {
        this.__deferredFetchFinished.resolve();
      }
    }
  }

  Application.registrations = [];

  return Application;
};
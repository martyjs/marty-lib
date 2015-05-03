var _ = require('../mindash');
var log = require('../core/logger');
var timeout = require('../core/utils/timeout');
var deferred = require('../core/utils/deferred');
var createDispatcher = require('../core/createDispatcher');
var UnknownStoreError = require('../errors/unknownStoreError');
var FetchDiagnostics = require('../isomorphism/fetchDiagnostics');

var DEFAULT_TIMEOUT = 1000;
var SERIALIZED_WINDOW_OBJECT = '__marty';

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

    getAllStores() {
      return this.getAll('Store');
    }

    register(key, ctor) {
      if (!this.dispatcher) {
        throw new Error('`super()` must be called before you can register anything');
      }

      if (!key) {
        throw new Error('Must specify a key or an object');
      }

      if (_.isString(key)) {
        if (!_.isFunction(ctor)) {
          throw new Error('Must pass in a instantiable object');
        }

        var obj = new ctor({
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
        _.each(key, (ctor, key) => {
          if (_.isFunction(ctor)) {
            this.register(key, ctor);
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

      if (diagnostics) {
        diagnostics.fetchStarted(storeId, fetchId);
      }
    }

    fetchFinished(storeId, fetchId, status, options) {
      var diagnostics = this.__diagnostics;

      if (diagnostics) {
        diagnostics.fetchFinished(storeId, fetchId, status, options);

        if (!diagnostics.hasPendingFetches) {
          this.__deferredFetchFinished.resolve();
        }
      }
    }

    clearState() {
      _.invoke(this.getAllStores(), 'clear');
    }

    replaceState(states) {
      _.each(this.getAllStores(), (store, id) => {
        if (states[id]) {
          store.replaceState(states[id]);
        }
      });
    }

    rehydrate(storeStates) {
      var stores = this.getAllStores();

      storeStates = storeStates || getStoreStatesFromWindow();

      _.each(storeStates, (dehydratedStore, storeId) => {
        var store = stores[storeId];
        var state = dehydratedStore.state;

        if (!store) {
          throw new UnknownStoreError(storeId);
        }

        store.__fetchHistory = dehydratedStore.fetchHistory;

        if (_.isFunction(store.rehydrate)) {
          store.rehydrate(state);
        } else {
          try {
            store.replaceState(state);
          } catch (e) {
            log.error(
              `Failed to rehydrate the state of ${storeId}. You might be able ` +
              `to solve this problem by implementing Store#rehydrate()`
            );

            throw e;
          }
        }
      });

      function getStoreStatesFromWindow() {
        if (!window || !window[SERIALIZED_WINDOW_OBJECT]) {
          return;
        }

        return window[SERIALIZED_WINDOW_OBJECT].stores;
      }
    }

    dehydrate() {
      var dehydratedStores = {};
      var stores = this.getAllStores();

      _.each(stores, (store, id) => {
        dehydratedStores[id] = {
          fetchHistory: store.__fetchHistory,
          state: (store.dehydrate || store.getState).call(store)
        };
      });

      dehydratedStores.toString = function () {
        return `(window.__marty||(window.__marty={})).stores=${JSON.stringify(dehydratedStores)}`;
      };

      dehydratedStores.toJSON = function () {
        return _.omit(dehydratedStores, 'toString', 'toJSON');
      };

      return dehydratedStores;
    }
  }

  return Application;
};
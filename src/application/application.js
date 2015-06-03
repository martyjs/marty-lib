let _ = require('../mindash');
let log = require('../core/logger');
let invariant = require('invariant');
let timeout = require('../core/utils/timeout');
let deferred = require('../core/utils/deferred');
let renderToString = require('./renderToString');
let FetchDiagnostics = require('./fetchDiagnostics');
let createDispatcher = require('../core/createDispatcher');
let UnknownStoreError = require('../errors/unknownStoreError');
let DEFAULT_TIMEOUT = 1000;
let SERIALIZED_WINDOW_OBJECT = '__marty';

module.exports = function (React) {
  class Application {
    constructor(options) {
      options = options || {};

      let dispatcher = createDispatcher();

      // Needed because we don't have access to actual Application type
      this.__isApplication = true;
      this.__isCoreType = true;
      this.__types = {};

      Object.defineProperty(this, 'dispatcher', {
        get() {
          return dispatcher;
        }
      });

      this.req = options.req;
      this.res = options.res;

      if (options.register) {
        this.register(options.register);
      }

      currentApplicationIs(this);
    }

    static __getCurrentApplication(cb) {
      return getCurrentApplication(cb);
    }

    getAll(type) {
      return this.__types[type] || {};
    }

    getAllStores() {
      return this.getAll('Store');
    }

    register(id, ctor) {
      if (!this.dispatcher) {
        throw new Error('`super()` must be called before you can register anything');
      }

      if (!id) {
        throw new Error('Must specify a id or an object');
      }

      if (_.isString(id)) {
        if (!_.isFunction(ctor)) {
          throw new Error('Must pass in a instantiable object');
        }

        let obj = new ctor({
          app: this,
          id: id
        });

        obj.id = id;

        let type = obj.__type;

        if (type) {
          if (!this.__types[type]) {
            this.__types[type] = {};
          }

          this.__types[type][id] = obj;
        }

        if (id.indexOf('.') === -1) {
          this[id] = obj;
        } else {
          var container = this;
          var parts = id.split('.');

          _.each(_.initial(parts), (part) => {
            if (_.isUndefined(container[part])) {
              container[part] = {};
            }

            container = container[part];
          });

          container[_.last(parts)] = obj;
        }
      }

      if (_.isObject(id)) {
        let registerObject = (obj, prefix) => {
          _.each(obj, (ctor, id) => {
            if (prefix) {
              id = `${prefix}.${id}`;
            }

            if (_.isFunction(ctor)) {
              this.register(id, ctor);
            } else if(_.isObject(ctor)) {
              registerObject(ctor, id);
            }
          });
        };

        registerObject(id);
      }
    }

    fetch(cb, options) {
      let fetchFinished;

      options = _.defaults(options || {}, {
        timeout: DEFAULT_TIMEOUT
      });

      this.__deferredFetchFinished = deferred();
      fetchFinished = this.__deferredFetchFinished.promise;
      this.__diagnostics = new FetchDiagnostics(options.prevDiagnostics);

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
        .then(() => this.__diagnostics);
    }

    fetchStarted(storeId, fetchId) {
      let diagnostics = this.__diagnostics;

      if (diagnostics) {
        diagnostics.fetchStarted(storeId, fetchId);
      }
    }

    fetchFinished(storeId, fetchId, status, options) {
      let diagnostics = this.__diagnostics;

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
      let stores = this.getAllStores();

      storeStates = storeStates || getStoreStatesFromWindow();

      _.each(storeStates, (dehydratedStore, storeId) => {
        let store = stores[storeId];
        let state = dehydratedStore.state;

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
      let dehydratedStores = {};
      let stores = this.getAllStores();

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

    renderToString(element, options) {
      return renderToString(
        this,
        React.renderToString,
        () => elementWithApp(element, this),
        options
      );
    }

    renderToStaticMarkup(element, options) {
      return renderToString(
        this,
        React.renderToStaticMarkup,
        () => elementWithApp(element, this),
        options
      );
    }
  }

  // Internal API used by DevTools to access the current application
  let currentApplication;
  let currentApplicationRequests = [];

  function currentApplicationIs(app) {
    currentApplication = app;
    _.each(currentApplicationRequests, cb => cb(app));
    currentApplicationRequests = [];
  }

  function getCurrentApplication(cb) {
    if (currentApplication) {
      cb(currentApplication);
    } else {
      currentApplicationRequests.push(cb);
    }
  }

  function elementWithApp(element, app) {
    invariant(
      element &&
      (typeof element.type === 'function' || typeof element.type === 'string'),
      'Must pass in a React component'
    );

    return React.cloneElement(element, {
      app: app
    });
  }

  return Application;
};
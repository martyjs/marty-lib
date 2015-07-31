'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');
var log = require('../core/logger');
var invariant = require('invariant');
var timeout = require('../core/utils/timeout');
var deferred = require('../core/utils/deferred');
var _renderToString = require('./renderToString');
var FetchDiagnostics = require('./fetchDiagnostics');
var createDispatcher = require('../core/createDispatcher');
var UnknownStoreError = require('../errors/unknownStoreError');

var DEFAULT_TIMEOUT = 1000;

var SERIALIZED_WINDOW_OBJECT = '__marty';
var WINDOW_STATE_ID = _renderToString.stateId;
var WINDOW_STATE_ATTR = _renderToString.stateAttr;

module.exports = function (React) {
  var Application = (function () {
    function Application(options) {
      _classCallCheck(this, Application);

      options = options || {};

      var dispatcher = createDispatcher();

      // Needed because we don't have access to actual Application type
      this.__isApplication = true;
      this.__isCoreType = true;
      this.__types = {};

      Object.defineProperty(this, 'dispatcher', {
        get: function get() {
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

    // Internal API used by DevTools to access the current application

    _createClass(Application, [{
      key: 'getAll',
      value: function getAll(type) {
        return this.__types[type] || {};
      }
    }, {
      key: 'getAllStores',
      value: function getAllStores() {
        return this.getAll('Store');
      }
    }, {
      key: 'register',
      value: function register(id, ctor) {
        var _this = this;

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

          var obj = new ctor({
            app: this,
            id: id
          });

          obj.id = id;

          var type = obj.__type;

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

            _.each(_.initial(parts), function (part) {
              if (_.isUndefined(container[part])) {
                container[part] = {};
              }

              container = container[part];
            });

            container[_.last(parts)] = obj;
          }
        }

        if (_.isObject(id)) {
          (function () {
            var registerObject = function registerObject(obj, prefix) {
              _.each(obj, function (ctor, id) {
                if (prefix) {
                  id = prefix + '.' + id;
                }

                if (_.isFunction(ctor)) {
                  _this.register(id, ctor);
                } else if (_.isObject(ctor)) {
                  registerObject(ctor, id);
                }
              });
            };

            registerObject(id);
          })();
        }
      }
    }, {
      key: 'fetch',
      value: function fetch(cb, options) {
        var _this2 = this;

        var fetchFinished = undefined;

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

        return Promise.race([fetchFinished, timeout(options.timeout)]).then(function () {
          return _this2.__diagnostics;
        });
      }
    }, {
      key: 'fetchStarted',
      value: function fetchStarted(storeId, fetchId) {
        var diagnostics = this.__diagnostics;

        if (diagnostics) {
          diagnostics.fetchStarted(storeId, fetchId);
        }
      }
    }, {
      key: 'fetchFinished',
      value: function fetchFinished(storeId, fetchId, status, options) {
        var diagnostics = this.__diagnostics;

        if (diagnostics) {
          diagnostics.fetchFinished(storeId, fetchId, status, options);

          if (!diagnostics.hasPendingFetches) {
            this.__deferredFetchFinished.resolve();
          }
        }
      }
    }, {
      key: 'clearState',
      value: function clearState() {
        _.invoke(this.getAllStores(), 'clear');
      }
    }, {
      key: 'replaceState',
      value: function replaceState(states) {
        _.each(this.getAllStores(), function (store, id) {
          if (states[id]) {
            store.replaceState(states[id]);
          }
        });
      }
    }, {
      key: 'rehydrate',
      value: function rehydrate(storeStates) {
        var stores = this.getAllStores();

        storeStates = storeStates || getStoreStatesFromWindow();

        _.each(storeStates, function (dehydratedStore, storeId) {
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
              log.error('Failed to rehydrate the state of ' + storeId + '. You might be able ' + 'to solve this problem by implementing Store#rehydrate()');

              throw e;
            }
          }
        });

        function getStoreStatesFromWindow() {
          if (!window) {
            return;
          }

          // Old-style method of setting up stores.
          var hasSerializedObjectStores = window[SERIALIZED_WINDOW_OBJECT] && window[SERIALIZED_WINDOW_OBJECT].stores;
          if (hasSerializedObjectStores) {
            return window[SERIALIZED_WINDOW_OBJECT].stores;
          }

          if (!window.document) {
            return;
          }

          var stateElement = window.document.getElementById(WINDOW_STATE_ID);
          if (!stateElement) {
            return;
          }

          var serializedState = stateElement.getAttribute(WINDOW_STATE_ATTR);
          if (!serializedState) {
            return;
          }

          return JSON.parse(serializedState);
        }
      }
    }, {
      key: 'dehydrate',
      value: function dehydrate() {
        var dehydratedStores = {};
        var stores = this.getAllStores();

        _.each(stores, function (store, id) {
          dehydratedStores[id] = {
            fetchHistory: store.__fetchHistory,
            state: (store.dehydrate || store.getState).call(store)
          };
        });

        // TODO: Remove code-based implementation of dehydrate.
        dehydratedStores.toString = function () {
          return '(window.__marty||(window.__marty={})).stores=' + JSON.stringify(dehydratedStores);
        };

        dehydratedStores.toJSON = function () {
          return _.omit(dehydratedStores, 'toString', 'toJSON');
        };

        return dehydratedStores;
      }
    }, {
      key: 'renderToString',
      value: function renderToString(element, options) {
        var _this3 = this;

        return _renderToString(this, React.renderToString, function () {
          return elementWithApp(element, _this3);
        }, options);
      }
    }, {
      key: 'renderToStaticMarkup',
      value: function renderToStaticMarkup(element, options) {
        var _this4 = this;

        return _renderToString(this, React.renderToStaticMarkup, function () {
          return elementWithApp(element, _this4);
        }, options);
      }
    }], [{
      key: '__getCurrentApplication',
      value: function __getCurrentApplication(cb) {
        return getCurrentApplication(cb);
      }
    }]);

    return Application;
  })();

  var currentApplication = undefined;
  var currentApplicationRequests = [];

  function currentApplicationIs(app) {
    currentApplication = app;
    _.each(currentApplicationRequests, function (cb) {
      return cb(app);
    });
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
    invariant(element && (typeof element.type === 'function' || typeof element.type === 'string'), 'Must pass in a React component');

    return React.cloneElement(element, {
      app: app
    });
  }

  return Application;
};
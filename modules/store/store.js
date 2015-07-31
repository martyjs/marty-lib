'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var log = require('../core/logger');
var fetch = require('./storeFetch');
var _ = require('../mindash');
var uuid = require('../core/utils/uuid');
var warnings = require('../core/warnings');
var StoreEvents = require('./storeEvents');
var Environment = require('../core/environment');
var handleAction = require('./handleAction');
var EventEmitter = require('wolfy87-eventemitter');
var validateHandlers = require('./validateHandlers');

var Store = (function () {
  function Store(options) {
    var _this = this;

    _classCallCheck(this, Store);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a store\'s constructor');
    }

    options = options || {};

    this.__state = {};
    this.id = options.id;
    this.__type = 'Store';
    this.__isStore = true;
    this.__app = options.app;
    this.__isCoreType = true;
    this.__fetchHistory = {};
    this.__failedFetches = {};
    this.__fetchInProgress = {};
    this.__id = uuid.type(this.__type);
    this.__emitter = new EventEmitter();
    this.__validateHandlers = _.once(function () {
      return validateHandlers(_this);
    });

    var initialState = this.getInitialState();

    if (_.isUndefined(initialState)) {
      initialState = {};
    }

    this.replaceState(initialState);

    this.dispatchToken = this.app.dispatcher.register(_.bind(this.handleAction, this));
  }

  _createClass(Store, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this.__state;
    }
  }, {
    key: 'setState',
    value: function setState(state) {
      var newState = _.extend({}, this.state, state);

      this.replaceState(newState);
    }
  }, {
    key: 'replaceState',
    value: function replaceState(newState) {
      var currentState = this.__state;

      if (_.isUndefined(newState) || _.isNull(newState)) {
        if (warnings.stateIsNullOrUndefined) {
          var displayName = this.displayName || this.id;

          log.warn('Warning: Trying to replace the state of the store ' + displayName + ' with null or undefined');
        }
      }

      if (newState !== currentState) {
        this.__state = newState;
        this.hasChanged();
      }
    }
  }, {
    key: 'clear',
    value: function clear(newState) {
      this.__fetchHistory = {};
      this.__failedFetches = {};
      this.__fetchInProgress = {};

      if (!newState && _.isFunction(this.getInitialState)) {
        newState = this.getInitialState();
      }

      this.state = newState || {};
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      var emitter = this.__emitter;
      var dispatchToken = this.dispatchToken;

      emitter.removeAllListeners(StoreEvents.CHANGE_EVENT);
      emitter.removeAllListeners(StoreEvents.FETCH_CHANGE_EVENT);
      this.clear();

      if (dispatchToken) {
        this.app.dispatcher.unregister(dispatchToken);
        this.dispatchToken = undefined;
      }
    }
  }, {
    key: 'hasChanged',
    value: function hasChanged(eventArgs) {
      var _this2 = this;

      var emitChange = function emitChange() {
        var emitter = _this2.__emitter;

        emitter.emit.call(emitter, StoreEvents.CHANGE_EVENT, _this2.state, _this2, eventArgs);

        // Clear the action once the component has seen it
        _this2.action = null;
      };

      if (this.action) {
        this.action.onActionHandled(this.id, emitChange);
      } else {
        emitChange();
      }
    }
  }, {
    key: 'hasAlreadyFetched',
    value: function hasAlreadyFetched(fetchId) {
      return !!this.__fetchHistory[fetchId];
    }
  }, {
    key: 'addChangeListener',
    value: function addChangeListener(callback, context) {
      var _this3 = this;

      var emitter = this.__emitter;

      if (context) {
        callback = _.bind(callback, context);
      }

      log.trace('The ' + this.displayName + ' store (' + this.id + ') is adding a change listener');

      emitter.on(StoreEvents.CHANGE_EVENT, callback);

      return {
        dispose: function dispose() {
          log.trace('The ' + _this3.displayName + ' store (' + _this3.id + ') is disposing of a change listener');

          emitter.removeListener(StoreEvents.CHANGE_EVENT, callback);
        }
      };
    }
  }, {
    key: 'addFetchChangedListener',
    value: function addFetchChangedListener(callback, context) {
      var emitter = this.__emitter;

      if (context) {
        callback = _.bind(callback, context);
      }

      emitter.on(StoreEvents.FETCH_CHANGE_EVENT, callback);

      return {
        dispose: function dispose() {
          emitter.removeListener(StoreEvents.FETCH_CHANGE_EVENT, callback);
        }
      };
    }
  }, {
    key: 'waitFor',
    value: function waitFor(stores) {
      var dispatcher = this.app.dispatcher;

      if (!_.isArray(stores)) {
        stores = _.toArray(arguments);
      }

      dispatcher.waitFor(dispatchTokens(stores));

      function dispatchTokens(stores) {
        var tokens = [];

        _.each(stores, function (store) {
          if (store.dispatchToken) {
            tokens.push(store.dispatchToken);
          }

          if (_.isString(store)) {
            tokens.push(store);
          }
        });

        return tokens;
      }
    }
  }, {
    key: 'app',
    get: function get() {
      return this.__app;
    }
  }, {
    key: 'state',
    get: function get() {
      return this.getState();
    },
    set: function set(newState) {
      this.replaceState(newState);
    }
  }]);

  return Store;
})();

Store.prototype.fetch = fetch;
Store.prototype.handleAction = handleAction;

module.exports = Store;
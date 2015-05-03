var log = require('marty-core').logger;
var fetch = require('./storeFetch');
var _ = require('marty-core')._;
var uuid = require('marty-core').utils.uuid;
var warnings = require('marty-core').warnings;
var resolve = require('marty-core').utils.resolve;
var StoreEvents = require('./storeEvents');
var Environment = require('marty-core').environment;
var handleAction = require('./handleAction');
var EventEmitter = require('wolfy87-eventemitter');
var validateHandlers = require('./validateHandlers');

class Store {
  constructor(options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a store\'s constructor');
    }

    options = options || {};

    this.__type = 'Store';
    this.__id = uuid.type(this.__type);
    this.__state = {};
    this.__fetchHistory = {};
    this.__failedFetches = {};
    this.__fetchInProgress = {};
    this.__context = options.context;
    this.__emitter = new EventEmitter();
    this.__dispatcher = options.dispatcher;
    this.__validateHandlers = _.once(() => validateHandlers(this));

    var initialState = this.getInitialState();

    if (_.isUndefined(initialState)) {
      initialState = {};
    }

    this.replaceState(initialState);

    this.dispatchToken = this.__dispatcher.register(
      _.bind(this.handleAction, this)
    );
  }

  for (obj) {
    return resolve(this, obj);
  }

  get context() {
    return this.__context;
  }

  get state() {
    return this.getState();
  }

  set state(newState) {
    this.replaceState(newState);
  }

  getInitialState() {
    return {};
  }

  getState() {
    return this.__state;
  }

  setState(state) {
    var newState = _.extend({}, this.state, state);

    this.replaceState(newState);
  }

  replaceState(newState) {
    var currentState = this.__state;

    if (_.isUndefined(newState) || _.isNull(newState)) {
      if (warnings.stateIsNullOrUndefined) {
        var displayName = this.displayName || this.id;

        log.warn(
          `Warning: Trying to replace the state of the store ${displayName} with null or undefined`
        );
      }
    }

    if (newState !== currentState) {
      this.__state = newState;
      this.hasChanged();
    }
  }

  clear(newState) {
    this.__fetchHistory = {};
    this.__failedFetches = {};
    this.__fetchInProgress = {};

    if (!newState && _.isFunction(this.getInitialState)) {
      newState = this.getInitialState();
    }

    this.state = newState || {};
  }

  dispose() {
    var emitter = this.__emitter;
    var dispatchToken = this.dispatchToken;

    emitter.removeAllListeners(StoreEvents.CHANGE_EVENT);
    emitter.removeAllListeners(StoreEvents.FETCH_CHANGE_EVENT);
    this.clear();

    if (dispatchToken) {
      this.__dispatcher.unregister(dispatchToken);
      this.dispatchToken = undefined;
    }
  }

  hasChanged(eventArgs) {
    var emitChange = () => {
      var emitter = this.__emitter;

      emitter.emit.call(emitter, StoreEvents.CHANGE_EVENT, this.state, this, eventArgs);

      // Clear the action once the component has seen it
      this.action = null;
    };

    if (this.action) {
      this.action.onActionHandled(this.id, emitChange);
    } else {
      emitChange();
    }
  }

  hasAlreadyFetched(fetchId) {
    return !!this.__fetchHistory[fetchId];
  }

  addChangeListener(callback, context) {
    var emitter = this.__emitter;

    if (context) {
      callback = _.bind(callback, context);
    }

    log.trace(
      `The ${this.displayName} store (${this.id}) is adding a change listener`
    );

    emitter.on(StoreEvents.CHANGE_EVENT, callback);

    return {
      dispose: () => {
        log.trace(
          `The ${this.displayName} store (${this.id}) is disposing of a change listener`
        );

        emitter.removeListener(StoreEvents.CHANGE_EVENT, callback);
      }
    };
  }

  addFetchChangedListener(callback, context) {
    var emitter = this.__emitter;

    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(StoreEvents.FETCH_CHANGE_EVENT, callback);

    return {
      dispose: () => {
        emitter.removeListener(StoreEvents.FETCH_CHANGE_EVENT, callback);
      }
    };
  }

  waitFor(stores) {
    var dispatcher = this.__dispatcher;

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
}

Store.prototype.fetch = fetch;
Store.prototype.handleAction = handleAction;

module.exports = Store;
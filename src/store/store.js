let log = require('../core/logger');
let fetch = require('./storeFetch');
let _ = require('../mindash');
let uuid= require('../core/utils/uuid');
let warnings = require('../core/warnings');
let StoreEvents = require('./storeEvents');
let Environment = require('../core/environment');
let handleAction = require('./handleAction');
let EventEmitter = require('wolfy87-eventemitter');
let validateHandlers = require('./validateHandlers');

class Store {
  constructor(options) {
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
    this.__validateHandlers = _.once(() => validateHandlers(this));

    let initialState = this.getInitialState();

    if (_.isUndefined(initialState)) {
      initialState = {};
    }

    this.replaceState(initialState);

    this.dispatchToken = this.app.dispatcher.register(
      _.bind(this.handleAction, this)
    );
  }

  get app() {
    return this.__app;
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
    let newState = _.extend({}, this.state, state);

    this.replaceState(newState);
  }

  replaceState(newState) {
    let currentState = this.__state;

    if (_.isUndefined(newState) || _.isNull(newState)) {
      if (warnings.stateIsNullOrUndefined) {
        let displayName = this.displayName || this.id;

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
    let emitter = this.__emitter;
    let dispatchToken = this.dispatchToken;

    emitter.removeAllListeners(StoreEvents.CHANGE_EVENT);
    emitter.removeAllListeners(StoreEvents.FETCH_CHANGE_EVENT);
    this.clear();

    if (dispatchToken) {
      this.app.dispatcher.unregister(dispatchToken);
      this.dispatchToken = undefined;
    }
  }

  hasChanged(eventArgs) {
    let emitChange = () => {
      let emitter = this.__emitter;

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
    let emitter = this.__emitter;

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
    let emitter = this.__emitter;

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
    let dispatcher = this.app.dispatcher;

    if (!_.isArray(stores)) {
      stores = _.toArray(arguments);
    }

    dispatcher.waitFor(dispatchTokens(stores));

    function dispatchTokens(stores) {
      let tokens = [];

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
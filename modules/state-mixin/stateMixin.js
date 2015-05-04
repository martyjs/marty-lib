'use strict';

var _ = require('../mindash');
var uuid = require('../core/utils/uuid');
var StoreObserver = require('../core/storeObserver');
var reservedKeys = ['listenTo', 'getState', 'getInitialState'];

function StateMixin(options) {
  var config = undefined,
      instanceMethods = undefined;

  if (!options) {
    throw new Error('The state mixin is expecting some options');
  }

  var React = options.React;

  if (isStore(options)) {
    config = storeMixinConfig(options);
  } else {
    config = simpleMixinConfig(options);
    instanceMethods = _.omit(options, reservedKeys);
  }

  var mixin = _.extend({
    contextTypes: {
      app: React.PropTypes.object,
      marty: React.PropTypes.object
    },
    componentDidMount: function componentDidMount() {
      var component = {
        id: this.__id,
        displayName: this.displayName || this.constructor.displayName };

      this.__observer = new StoreObserver({
        component: component,
        stores: config.stores,
        app: this.context.app,
        onStoreChanged: this.onStoreChanged
      });
    },
    onStoreChanged: function onStoreChanged() {
      this.setState(this.getState());
    },
    componentWillUnmount: function componentWillUnmount() {
      if (this.__observer) {
        this.__observer.dispose();
      }
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      var oldProps = this.props;
      this.props = nextProps;

      var newState = this.getState();

      this.props = oldProps;
      this.setState(newState);
    },
    getState: function getState() {
      return config.getState(this);
    },
    getInitialState: function getInitialState() {
      var _this = this;

      Object.defineProperty(this, 'app', {
        get: function get() {
          if (_this.context) {
            return _this.context.app;
          }
        }
      });

      var el = this._currentElement;

      if (!this.displayName && el && el.type) {
        this.displayName = el.type.displayName;
      }

      this.state = {};
      this.__id = uuid.type('Component');

      if (options.getInitialState) {
        this.state = options.getInitialState();
      }

      this.state = _.extend(this.state, this.getState());

      return this.state;
    }
  }, instanceMethods);

  return mixin;

  function storeMixinConfig(store) {
    return {
      stores: [store],
      getState: function getState() {
        return store.getState();
      }
    };
  }

  function simpleMixinConfig(options) {
    var stores = options.listenTo || [];
    var storesToGetStateFrom = findStoresToGetStateFrom(options);

    if (!_.isArray(stores)) {
      stores = [stores];
    }

    stores = stores.concat(_.values(storesToGetStateFrom));

    return {
      stores: stores,
      getState: getState
    };

    function getState(view) {
      var state = _.object(_.map(storesToGetStateFrom, getStateFromStore));

      if (options.getState) {
        state = _.extend(state, options.getState.call(view));
      }

      return state;

      function getStateFromStore(store, name) {
        return [name, store.getState()];
      }
    }

    function findStoresToGetStateFrom(options) {
      var storesToGetStateFrom = {};
      _.each(options, function (value, key) {
        if (reservedKeys.indexOf(key) === -1 && isStore(value)) {
          storesToGetStateFrom[key] = value;
        }
      });

      return storesToGetStateFrom;
    }
  }

  function isStore(store) {
    return store && store.__isStore;
  }
}

module.exports = StateMixin;
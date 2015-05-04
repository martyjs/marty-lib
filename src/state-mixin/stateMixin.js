let _ = require('../mindash');
let uuid = require('../core/utils/uuid');
let StoreObserver = require('../core/storeObserver');
let reservedKeys = ['listenTo', 'getState', 'getInitialState'];

function StateMixin(options) {
  let config, instanceMethods;

  if (!options) {
    throw new Error('The state mixin is expecting some options');
  }

  let React = options.React;

  if (isStore(options)) {
    config = storeMixinConfig(options);
  } else {
    config = simpleMixinConfig(options);
    instanceMethods = _.omit(options, reservedKeys);
  }

  let mixin = _.extend({
    contextTypes: {
      app: React.PropTypes.object,
      marty: React.PropTypes.object
    },
    componentDidMount: function () {
      let component = {
        id: this.__id,
        displayName: this.displayName || this.constructor.displayName,
      };

      this.__observer = new StoreObserver({
        component: component,
        stores: config.stores,
        app: this.context.app,
        onStoreChanged: this.onStoreChanged
      });
    },
    onStoreChanged: function () {
      this.setState(this.getState());
    },
    componentWillUnmount: function () {
      if (this.__observer) {
        this.__observer.dispose();
      }
    },
    componentWillReceiveProps: function (nextProps) {
      let oldProps = this.props;
      this.props = nextProps;

      let newState = this.getState();

      this.props = oldProps;
      this.setState(newState);
    },
    getState: function () {
      return config.getState(this);
    },
    getInitialState: function () {
      Object.defineProperty(this, 'app', {
        get: () => {
          if (this.context) {
            return this.context.app;
          }
        }
      });

      let el = this._currentElement;

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
      getState: function () {
        return store.getState();
      }
    };
  }

  function simpleMixinConfig(options) {
    let stores = (options.listenTo || []);
    let storesToGetStateFrom = findStoresToGetStateFrom(options);

    if (!_.isArray(stores)) {
      stores = [stores];
    }

    stores = stores.concat(_.values(storesToGetStateFrom));

    return {
      stores: stores,
      getState: getState
    };

    function getState(view) {
      let state = _.object(_.map(storesToGetStateFrom, getStateFromStore));

      if (options.getState) {
        state = _.extend(state, options.getState.call(view));
      }

      return state;

      function getStateFromStore(store, name) {
        return [name, store.getState()];
      }
    }

    function findStoresToGetStateFrom(options) {
      let storesToGetStateFrom = {};
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
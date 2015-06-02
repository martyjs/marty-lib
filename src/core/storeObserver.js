let log = require('./logger');
let _ = require('../mindash');


class StoreObserver {
  constructor(options) {
    options = options || {};

    this.app = options.app;
    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    var stores = resolveStores(options);

    this.listeners = _.map(stores, (store) => {
      return this.listenToStore(store);
    });
  }

  dispose() {
    _.invoke(this.listeners, 'dispose');
  }

  listenToStore(store) {
    let component = this.component;
    let storeDisplayName = store.displayName || store.id;

    log.trace(
      `The ${component.displayName} component  (${component.id}) is listening to the ${storeDisplayName} store`
    );

    return store.addChangeListener((state, store) => {
      let storeDisplayName = store.displayName || store.id;

      log.trace(
        `${storeDisplayName} store has changed. ` +
        `The ${this.component.displayName} component (${this.component.id}) is updating`
      );

      if (store && store.action) {
        store.action.addComponentHandler({
          displayName: this.component.displayName
        }, store);
      }

      this.onStoreChanged(store);
    });
  }
}

function resolveStores(options) {
  var app = options.app;
  var stores = options.stores;

  if (stores && !_.isArray(stores)) {
    stores = [stores];
  }

  return _.map(stores, storeId => {
    if (!_.isString(storeId)) {
      throw new Error(
        'Store Id\'s must be strings. If you\'re migrating to v0.10 ' +
        'you have probably forgotten to update listenTo'
      );
    }

    if (!app) {
      throw new Error('Component not bound to an application');
    }
    var store = _.get(app, storeId, null);
    if (!store) {
      throw new Error(`Could not find the store ${storeId}`);
    }

    return store;
  });
}

module.exports = StoreObserver;

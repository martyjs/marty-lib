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
  var stores = options.stores;
  var appStores = options.app ? options.app.getAllStores() : {};

  if (stores && !_.isArray(stores)) {
    stores = [stores];
  }

  return _.map(stores, (store) => {
    if (_.isString(store)) {
      if (!options.app) {
        throw new Error('You can only reference stores by string if you are using an application.');
      }

      if (!appStores[store]) {
        throw new Error(`Could not find the store ${store}`);
      }

      return appStores[store];
    }

    if (!_.isFunction(store.addChangeListener)) {
      throw new Error('Cannot listen to things that are not a store');
    }

    return store;
  });
}

module.exports = StoreObserver;
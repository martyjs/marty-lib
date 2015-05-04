let _ = require('../mindash');
let uuid = require('../core/utils/uuid');
let logger = require('../core/logger');
let warnings = require('../core/warnings');
let timeout = require('../core/utils/timeout');
let deferred = require('../core/utils/deferred');
let FetchDiagnostics = require('./fetchDiagnostics');
let createDispatcher = require('../core/createDispatcher');

let DEFAULT_TIMEOUT = 1000;

class Context {
  constructor(registry) {
    this.instances = {};
    this.__isContext = true;
    this.id = uuid.type('Context');
    this.dispatcher = createDispatcher();

    _.each((registry || {}).types, (classes, type) => {
      let options = {
        context: this,
        dispatcher: this.dispatcher
      };

      this.instances[type] = {};

      _.each(classes, (clazz) => {
        this.instances[type][clazz.id] = registry.resolve(
          type,
          clazz.id,
          options
        );
      });
    });
  }

  fetch(cb, options) {
    let fetchFinished;

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
    let diagnostics = this.__diagnostics;

    diagnostics.fetchStarted(storeId, fetchId);
  }

  fetchDone(storeId, fetchId, status, options) {
    if (warnings.fetchDoneRenamedFetchFailed) {
      logger.warn('Warning: fetchDone has been renamed fetchFinished');
    }

    return this.fetchFinished(storeId, fetchId, status, options);
  }

  fetchFinished(storeId, fetchId, status, options) {
    let diagnostics = this.__diagnostics;

    diagnostics.fetchFinished(storeId, fetchId, status, options);

    if (!diagnostics.hasPendingFetches) {
      this.__deferredFetchFinished.resolve();
    }
  }

  dispose() {
    _.each(this.instances, (instances) => {
      _.each(instances, (instance) => {
        if (_.isFunction(instance.dispose)) {
          instance.dispose();
        }
      });
    });

    this.instances = null;
    this.dispatcher = null;
  }

  resolve(obj) {
    if (!obj.constructor) {
      throw new Error('Cannot resolve object');
    }

    let id = obj.constructor.id;
    let type = obj.constructor.type;

    if (!this.instances[type]) {
      throw new Error(`Context does not have any instances of ${type}`);
    }

    if (!this.instances[type][id]) {
      throw new Error(`Context does not have an instance of the ${type} id`);
    }

    return this.instances[type][id];
  }

  getAll(type) {
    return _.values(this.instances[type]);
  }

  getAllStores() {
    return this.getAll('Store');
  }

  getAllStateSources() {
    return this.getAll('StateSource');
  }

  getAllActionCreators() {
    return this.getAll('ActionCreators');
  }

  getAllQueries() {
    return this.getAll('Queries');
  }
}

module.exports = Context;

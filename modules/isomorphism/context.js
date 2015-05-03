var _ = require('../mindash');
var uuid = require('../core/utils/uuid');
var timeout = require('../core/utils/timeout');
var deferred = require('../core/utils/deferred');
var FetchDiagnostics = require('./fetchDiagnostics');
var createDispatcher = require('../core/createDispatcher')

var DEFAULT_TIMEOUT = 1000;

class Context {
  constructor(registry) {
    this.instances = {};
    this.__isContext = true;
    this.id = uuid.type('Context');
    this.dispatcher = createDispatcher();

    _.each((registry || {}).types, (classes, type) => {
      var options = {
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
    var fetchDone;

    options = _.defaults(options || {}, {
      timeout: DEFAULT_TIMEOUT
    });

    this.__deferredFetchDone = deferred();
    this.__diagnostics = new FetchDiagnostics();
    fetchDone = this.__deferredFetchDone.promise;

    try {
      cb.call(this);
    } catch (e) {
      this.__deferredFetchDone.reject(e);

      return fetchDone;
    }

    if (!this.__diagnostics.hasPendingFetches) {
      this.__deferredFetchDone.resolve();
    }

    return Promise
      .race([fetchDone, timeout(options.timeout)])
      .then(() => this.__diagnostics.toJSON());
  }

  fetchStarted(storeId, fetchId) {
    var diagnostics = this.__diagnostics;

    diagnostics.fetchStarted(storeId, fetchId);
  }

  fetchDone(storeId, fetchId, status, options) {
    var diagnostics = this.__diagnostics;

    diagnostics.fetchDone(storeId, fetchId, status, options);

    if (!diagnostics.hasPendingFetches) {
      this.__deferredFetchDone.resolve();
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

    var id = obj.constructor.id;
    var type = obj.constructor.type;

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

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');
var uuid = require('../core/utils/uuid');
var logger = require('../core/logger');
var warnings = require('../core/warnings');
var timeout = require('../core/utils/timeout');
var deferred = require('../core/utils/deferred');
var FetchDiagnostics = require('./fetchDiagnostics');
var createDispatcher = require('../core/createDispatcher');

var DEFAULT_TIMEOUT = 1000;

var Context = (function () {
  function Context(registry) {
    var _this = this;

    _classCallCheck(this, Context);

    this.instances = {};
    this.__isContext = true;
    this.id = uuid.type('Context');
    this.dispatcher = createDispatcher();

    _.each((registry || {}).types, function (classes, type) {
      var options = {
        context: _this,
        dispatcher: _this.dispatcher
      };

      _this.instances[type] = {};

      _.each(classes, function (clazz) {
        _this.instances[type][clazz.id] = registry.resolve(type, clazz.id, options);
      });
    });
  }

  _createClass(Context, [{
    key: 'fetch',
    value: function fetch(cb, options) {
      var _this2 = this;

      var fetchFinished = undefined;

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

      return Promise.race([fetchFinished, timeout(options.timeout)]).then(function () {
        return _this2.__diagnostics.toJSON();
      });
    }
  }, {
    key: 'fetchStarted',
    value: function fetchStarted(storeId, fetchId) {
      var diagnostics = this.__diagnostics;

      diagnostics.fetchStarted(storeId, fetchId);
    }
  }, {
    key: 'fetchDone',
    value: function fetchDone(storeId, fetchId, status, options) {
      if (warnings.fetchDoneRenamedFetchFailed) {
        logger.warn('Warning: fetchDone has been renamed fetchFinished');
      }

      return this.fetchFinished(storeId, fetchId, status, options);
    }
  }, {
    key: 'fetchFinished',
    value: function fetchFinished(storeId, fetchId, status, options) {
      var diagnostics = this.__diagnostics;

      diagnostics.fetchFinished(storeId, fetchId, status, options);

      if (!diagnostics.hasPendingFetches) {
        this.__deferredFetchFinished.resolve();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _.each(this.instances, function (instances) {
        _.each(instances, function (instance) {
          if (_.isFunction(instance.dispose)) {
            instance.dispose();
          }
        });
      });

      this.instances = null;
      this.dispatcher = null;
    }
  }, {
    key: 'resolve',
    value: function resolve(obj) {
      if (!obj.constructor) {
        throw new Error('Cannot resolve object');
      }

      var id = obj.constructor.id;
      var type = obj.constructor.type;

      if (!this.instances[type]) {
        throw new Error('Context does not have any instances of ' + type);
      }

      if (!this.instances[type][id]) {
        throw new Error('Context does not have an instance of the ' + type + ' id');
      }

      return this.instances[type][id];
    }
  }, {
    key: 'getAll',
    value: function getAll(type) {
      return _.values(this.instances[type]);
    }
  }, {
    key: 'getAllStores',
    value: function getAllStores() {
      return this.getAll('Store');
    }
  }, {
    key: 'getAllStateSources',
    value: function getAllStateSources() {
      return this.getAll('StateSource');
    }
  }, {
    key: 'getAllActionCreators',
    value: function getAllActionCreators() {
      return this.getAll('ActionCreators');
    }
  }, {
    key: 'getAllQueries',
    value: function getAllQueries() {
      return this.getAll('Queries');
    }
  }]);

  return Context;
})();

module.exports = Context;
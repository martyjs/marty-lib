'use strict';

var _ = require('../mindash');
var uuid = require('./utils/uuid');

function ActionPayload(options) {
  options || (options = {});

  var stores = [];
  var components = [];
  var actionHandledCallbacks = {};

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addComponentHandler = addComponentHandler;
  this.timestamp = options.timestamp || new Date();

  Object.defineProperty(this, 'stores', {
    get: function get() {
      return stores;
    }
  });

  Object.defineProperty(this, 'components', {
    get: function get() {
      return components;
    }
  });

  function actionType(type) {
    if (_.isFunction(type)) {
      return type.toString();
    }

    return type;
  }

  function toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  function toJSON() {
    var json = _.pick(this, 'id', 'type', 'stores', 'arguments', 'timestamp', 'components');

    return json;
  }

  function handled() {
    _.each(actionHandledCallbacks, function (callback) {
      return callback();
    });
  }

  function onActionHandled(id, cb) {
    actionHandledCallbacks[id] = cb;
  }

  function addComponentHandler(component, store) {
    components.push(_.extend({
      id: uuid.small(),
      store: store.id || store.displayName
    }, component));
  }

  function addStoreHandler(store, handlerName) {
    stores.push({
      id: uuid.small(),
      handler: handlerName,
      store: store.id || store.displayName
    });
  }
}

module.exports = ActionPayload;
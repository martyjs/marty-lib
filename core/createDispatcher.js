var _ = require('../mindash');
var uuid = require('./utils/uuid');
var Dispatcher = require('flux').Dispatcher;
var ActionPayload = require('./actionPayload');
var EventEmitter = require('wolfy87-eventemitter');

var ACTION_DISPATCHED = 'ACTION_DISPATCHED';

function createDispatcher() {
  var emitter = new EventEmitter();
  var dispatcher = new Dispatcher();

  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  dispatcher.dispatchAction = function (options) {
    var action = new ActionPayload(options);

    this.dispatch(action);

    action.handled();
    emitter.emit(ACTION_DISPATCHED, action);

    return action;
  };

  dispatcher.onActionDispatched = function (callback, context) {
    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(ACTION_DISPATCHED, callback);

    return {
      dispose: function () {
        emitter.removeListener(ACTION_DISPATCHED, callback);
      }
    };
  };

  return dispatcher;
}

module.exports = createDispatcher;
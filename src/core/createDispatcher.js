let _ = require('../mindash');
let uuid = require('./utils/uuid');
let Dispatcher = require('flux').Dispatcher;
let ActionPayload = require('./actionPayload');
let EventEmitter = require('wolfy87-eventemitter');

let ACTION_DISPATCHED = 'ACTION_DISPATCHED';

function createDispatcher() {
  let emitter = new EventEmitter();
  let dispatcher = new Dispatcher();

  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  dispatcher.dispatchAction = function (options) {
    let action = new ActionPayload(options);

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
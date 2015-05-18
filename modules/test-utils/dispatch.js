'use strict';

function dispatch(app, type) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  if (!app) {
    throw new Error('Must specify the application');
  }

  if (!type) {
    throw new Error('Must specify the action type');
  }

  return app.dispatcher.dispatchAction({
    type: type,
    arguments: args
  });
}

module.exports = dispatch;
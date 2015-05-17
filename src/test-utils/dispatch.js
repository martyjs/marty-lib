function dispatch(app, type, ...args) {
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
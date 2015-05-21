function findApp(obj) {
  if (obj) {
    if (obj.context && obj.context.app) {
      return obj.context.app;
    }

    if (obj.props && obj.props.app) {
      return obj.props.app;
    }
  }
}

module.exports = findApp;
let _ = require('../mindash');
let DEFAULT_OPTIONS = {
  include: [],
  exclude: [],
  stub: {}
};

function createApplication(Application, options) {
  let {
    include,
    exclude,
    stub
  } = _.defaults(options || {}, DEFAULT_OPTIONS);

  // Inherit from application so we modify prototype
  class TestApplication extends Application { }

  let _register = TestApplication.prototype.register;

  if (!_.isArray(include)) {
    include = [include];
  }

  if (!_.isArray(exclude)) {
    exclude = [exclude];
  }

  let stubIds = _.keys(stub);

  TestApplication.prototype.register = function stubRegister(key, value) {
    if (!_.isString(key)) {
      _register.apply(this, arguments);
    } else if (stub[key]) {
      this[key] = stub[key];
      stubIds = _.difference(stubIds, [key]);
    } else if (include.length) {
      if (include.indexOf(key) !== -1) {
        _register.call(this, key, value);
      }
    } else if (exclude.length) {
      if (include.indexOf(key) === -1) {
        _register.call(this, key, value);
      }
    }
  };

  let app = new TestApplication();

  app.dispatcher.dispatchedActions = [];
  app.dispatcher.register(action => {
    app.dispatcher.dispatchedActions.push(action);
  });

  // If any properties have not been registered
  // then just re-assign them
  _.each(stubIds,  id => app[id] = stub[id]);

  return app;
}

module.exports = createApplication;
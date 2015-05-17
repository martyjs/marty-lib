var _ = require('../mindash');
var DEFAULT_OPTIONS = {
  include: [],
  exclude: [],
  stub: {}
};

function createApplication(Application, options) {
  var {
    include,
    exclude,
    stub
  } = _.defaults(options || {}, DEFAULT_OPTIONS);

  // Inherit from application so we modify prototype
  class TestApplication extends Application { }

  var _register = TestApplication.prototype.register;

  if (!_.isArray(include)) {
    include = [include];
  }

  if (!_.isArray(exclude)) {
    exclude = [exclude];
  }

  TestApplication.prototype.register = function stubRegister(key, value) {
    if (!_.isString(key)) {
      _register.apply(this, arguments);
    } else if (stub[key]) {
      this[key] = stub[key];
    } else if (include.length) {
      if (include.indexOf(key) !== -1) {
        _register.call(this, key, value);
      }
    } else if (exclude.length) {
      if (include.indexOf(key) === -1) {
        _register.call(this, key, value);
      }
    }
  }

  return new TestApplication();
}

module.exports = createApplication;
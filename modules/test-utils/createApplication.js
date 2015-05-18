'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ = require('../mindash');
var DEFAULT_OPTIONS = {
  include: [],
  exclude: [],
  stub: {}
};

function createApplication(Application, options) {
  var _$defaults = _.defaults(options || {}, DEFAULT_OPTIONS);

  var include = _$defaults.include;
  var exclude = _$defaults.exclude;
  var stub = _$defaults.stub;

  // Inherit from application so we modify prototype

  var TestApplication = (function (_Application) {
    function TestApplication() {
      _classCallCheck(this, TestApplication);

      if (_Application != null) {
        _Application.apply(this, arguments);
      }
    }

    _inherits(TestApplication, _Application);

    return TestApplication;
  })(Application);

  var _register = TestApplication.prototype.register;

  if (!_.isArray(include)) {
    include = [include];
  }

  if (!_.isArray(exclude)) {
    exclude = [exclude];
  }

  var stubIds = _.keys(stub);

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

  var app = new TestApplication();

  app.dispatcher.dispatchedActions = [];
  app.dispatcher.register(function (action) {
    app.dispatcher.dispatchedActions.push(action);
  });

  // If any properties have not been registered
  // then just re-assign them
  _.each(stubIds, function (id) {
    return app[id] = stub[id];
  });

  return app;
}

module.exports = createApplication;
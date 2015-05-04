'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');
var log = require('./logger');
var warnings = require('./warnings');
var classId = require('./utils/classId');
var Environment = require('./environment');
var humanStrings = require('./utils/humanStrings');

var FUNCTIONS_TO_NOT_WRAP = ['fetch'];

var Registry = (function () {
  function Registry(options) {
    _classCallCheck(this, Registry);

    this.types = {};
    this.classes = {};
    this.defaults = {};
    this.defaultDispatcher = options.defaultDispatcher;
  }

  _createClass(Registry, [{
    key: 'addClass',
    value: function addClass(id, clazz) {
      this.classes[id] = clazz;
      addClassHelper(this, id);
    }
  }, {
    key: 'getClassId',
    value: function getClassId(obj) {
      var id = _.findKey(this.classes, function (type) {
        return obj instanceof type;
      });

      if (!id) {
        throw new Error('Unknown type');
      }

      return id;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.types = {};
    }
  }, {
    key: 'get',
    value: function get(type, id) {
      return (this.types[type] || {})[id];
    }
  }, {
    key: 'getAll',
    value: function getAll(type) {
      return _.values(this.types[type] || {});
    }
  }, {
    key: 'getDefault',
    value: function getDefault(type, id) {
      return this.defaults[type][id];
    }
  }, {
    key: 'getAllDefaults',
    value: function getAllDefaults(type) {
      return _.values(this.defaults[type]);
    }
  }, {
    key: 'register',
    value: function register(clazz) {
      var defaultInstance = new clazz({
        dispatcher: this.defaultDispatcher
      });
      var type = this.getClassId(defaultInstance);

      defaultInstance.__isDefaultInstance = true;

      if (!this.types[type]) {
        this.types[type] = {};
      }

      if (!this.defaults[type]) {
        this.defaults[type] = {};
      }

      var id = classId(clazz, type);

      if (!id) {
        throw CannotRegisterClassError(clazz, type);
      }

      if (this.types[type][id]) {
        throw ClassAlreadyRegisteredWithId(clazz, type);
      }

      clazz.id = id;
      defaultInstance.id = defaultInstance.id || id;
      defaultInstance.type = clazz.type = type;

      this.types[type][id] = clazz;

      if (Environment.isServer) {
        _.each(_.functions(defaultInstance), wrapResolverFunctions, defaultInstance);
      }

      this.defaults[type][id] = defaultInstance;

      return defaultInstance;
    }
  }, {
    key: 'resolve',
    value: function resolve(type, id, options) {
      var clazz = (this.types[type] || {})[id];

      if (!clazz) {
        throw CannotFindTypeWithId(type, id);
      }

      return new clazz(options);
    }
  }]);

  return Registry;
})();

module.exports = Registry;

function wrapResolverFunctions(functionName) {
  if (FUNCTIONS_TO_NOT_WRAP.indexOf(functionName) !== -1) {
    return;
  }

  var instance = this;
  var originalFunc = instance[functionName];

  instance[functionName] = function () {
    if (warnings.callingResolverOnServer && Environment.isServer) {
      var type = instance.__type;
      var displayName = instance.displayName || instance.id;
      var warningMessage = 'Warning: You are calling `' + functionName + '` on the static instance of the ' + type + ' ' + ('\'' + displayName + '\'. You should resolve the instance for the current context');

      log.warn(warningMessage);
    }

    return originalFunc.apply(instance, arguments);
  };
}

function addClassHelper(registry, classId) {
  var pluralClassId = classId;

  if (pluralClassId[pluralClassId.length - 1] !== 's') {
    pluralClassId += 's';
  }

  registry['get' + classId] = partial(registry.get, classId);
  registry['resolve' + classId] = partial(registry.resolve, classId);
  registry['getAll' + pluralClassId] = partial(registry.getAll, classId);
  registry['getDefault' + classId] = partial(registry.getDefault, classId);
  registry['getAllDefault' + pluralClassId] = partial(registry.getAllDefaults, classId);

  function partial(func, type) {
    return function () {
      var args = _.toArray(arguments);
      args.unshift(type);
      return func.apply(this, args);
    };
  }
}

function CannotFindTypeWithId(type, id) {
  return new Error('Could not find ' + type + ' with Id ' + id);
}

function CannotRegisterClassError(clazz, type) {
  var displayName = clazz.displayName || clazz.id;
  var typeDisplayName = humanStrings[type] || type;
  var warningPrefix = 'Cannot register the ' + typeDisplayName;

  if (displayName) {
    warningPrefix += ' \'' + displayName + '\'';
  }

  return new Error('' + warningPrefix + ' because it does not have an Id');
}

function ClassAlreadyRegisteredWithId(clazz, type) {
  var displayName = clazz.displayName || clazz.id;
  var typeDisplayName = humanStrings[type] || type;
  var warningPrefix = 'Cannot register the ' + typeDisplayName;

  if (displayName) {
    warningPrefix += ' \'' + displayName + '\'';
  }

  return new Error('' + warningPrefix + ' because there is already a class with that Id.');
}
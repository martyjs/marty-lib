'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var hooks = {};
var log = require('../core/logger');
var _ = require('../mindash');
var StateSource = require('../core/stateSource');
var accepts = {
  html: 'text/html',
  text: 'text/plain',
  json: 'application/json',
  xml: 'application/xml, text/xml',
  script: 'text/javascript, application/javascript, application/x-javascript'
};

var HttpStateSource = (function (_StateSource) {
  _inherits(HttpStateSource, _StateSource);

  function HttpStateSource(options) {
    _classCallCheck(this, HttpStateSource);

    _get(Object.getPrototypeOf(HttpStateSource.prototype), 'constructor', this).call(this, options);
    this._isHttpStateSource = true;
  }

  _createClass(HttpStateSource, [{
    key: 'request',
    value: function request(req) {
      var _this = this;

      if (!req.headers) {
        req.headers = {};
      }

      beforeRequest(this, req);

      return fetch(req.url, req).then(function (res) {
        return afterRequest(_this, res);
      });
    }
  }, {
    key: 'get',
    value: function get(options) {
      return this.request(requestOptions('GET', this, options));
    }
  }, {
    key: 'put',
    value: function put(options) {
      return this.request(requestOptions('PUT', this, options));
    }
  }, {
    key: 'post',
    value: function post(options) {
      return this.request(requestOptions('POST', this, options));
    }
  }, {
    key: 'delete',
    value: function _delete(options) {
      return this.request(requestOptions('DELETE', this, options));
    }
  }, {
    key: 'patch',
    value: function patch(options) {
      return this.request(requestOptions('PATCH', this, options));
    }
  }], [{
    key: 'addHook',
    value: function addHook(hook) {
      if (!hook) {
        throw new Error('Must specify a hook');
      }

      if (_.isUndefined(hook.id)) {
        throw new Error('Hook must have an id');
      }

      if (_.isUndefined(hook.priority)) {
        hook.priority = Object.keys(hooks).length;
      }

      hooks[hook.id] = hook;
    }
  }, {
    key: 'removeHook',
    value: function removeHook(hook) {
      if (hook) {
        if (_.isString(hook)) {
          delete hooks[hook];
        } else if (_.isString(hook.id)) {
          delete hooks[hook.id];
        }
      }
    }
  }, {
    key: 'defaultBaseUrl',
    get: function get() {
      return '';
    }
  }]);

  return HttpStateSource;
})(StateSource);

HttpStateSource.addHook(require('./hooks/parseJSON'));
HttpStateSource.addHook(require('./hooks/stringifyJSON'));
HttpStateSource.addHook(require('./hooks/includeCredentials'));

module.exports = HttpStateSource;

function requestOptions(method, source, options) {
  var baseUrl = source.baseUrl || HttpStateSource.defaultBaseUrl;

  if (_.isString(options)) {
    options = _.extend({
      url: options
    });
  }

  _.defaults(options, {
    headers: {}
  });

  options.method = method.toUpperCase();

  if (baseUrl) {
    var separator = '';
    var firstCharOfUrl = options.url[0];
    var lastCharOfBaseUrl = baseUrl[baseUrl.length - 1];

    // Do some text wrangling to make sure concatenation of base url
    // stupid people (i.e. me)
    if (lastCharOfBaseUrl !== '/' && firstCharOfUrl !== '/') {
      separator = '/';
    } else if (lastCharOfBaseUrl === '/' && firstCharOfUrl === '/') {
      options.url = options.url.substring(1);
    }

    options.url = baseUrl + separator + options.url;
  }

  if (options.contentType) {
    options.headers['Content-Type'] = options.contentType;
  }

  if (options.dataType) {
    var contentType = accepts[options.dataType];

    if (!contentType) {
      log.warn('Unknown data type ' + options.dataType);
    } else {
      options.headers['Accept'] = contentType;
    }
  }

  return options;
}

function beforeRequest(source, req) {
  _.each(getHooks('before'), function (hook) {
    try {
      hook.before.call(source, req);
    } catch (e) {
      log.error('Failed to execute hook before http request', e, hook);
      throw e;
    }
  });
}

function afterRequest(source, res) {
  var current = undefined;

  _.each(getHooks('after'), function (hook) {
    var execute = function execute(res) {
      try {
        return hook.after.call(source, res);
      } catch (e) {
        log.error('Failed to execute hook after http response', e, hook);
        throw e;
      }
    };

    if (current) {
      current = current.then(function (res) {
        return execute(res);
      });
    } else {
      current = execute(res);

      if (current && !_.isFunction(current.then)) {
        current = Promise.resolve(current);
      }
    }
  });

  return current || res;
}

function getHooks(func) {
  return _.sortBy(_.filter(hooks, has(func)), priority);

  function priority(hook) {
    return hook.priority;
  }

  function has(func) {
    return function (hook) {
      return hook && _.isFunction(hook[func]);
    };
  }
}
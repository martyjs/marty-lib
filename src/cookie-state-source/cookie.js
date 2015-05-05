let _ = require('../mindash');
let invariant = require('invariant');
let cookieFactory = defaultCookieFactory;
let StateSource = require('../core/stateSource');

class CookieStateSource extends StateSource {
  constructor(options) {
    super(options);
    this._isCookieStateSource = true;
    this._cookies = cookieFactory(this.app);
  }

  get(key) {
    invariant(_.isString(key), 'key must be a string');

    return this._cookies.get(key);
  }

  set(key, value, options) {
    invariant(_.isString(key), 'key must be a string');

    return this._cookies.set(key, value, options);
  }

  expire(key) {
    invariant(_.isString(key), 'key must be a string');

    return this._cookies.expire(key);
  }

  static setCookieFactory(value) {
    cookieFactory = value;
  }
}

function defaultCookieFactory() {
  return require('cookies-js');
}

module.exports = CookieStateSource;
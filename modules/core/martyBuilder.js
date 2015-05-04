"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MartyBuilder = (function () {
  function MartyBuilder(marty) {
    _classCallCheck(this, MartyBuilder);

    this._marty = marty;
    this.stateSources = {};
  }

  _createClass(MartyBuilder, [{
    key: "registerStateSource",
    value: function registerStateSource(id, stateSourceId, clazz) {
      this.registerClass(id, clazz);
      this.stateSources[stateSourceId] = clazz;
    }
  }, {
    key: "registerClass",
    value: function registerClass(id, clazz) {
      this._marty[id] = clazz;
      this._marty.registry.addClass(id, clazz);
    }
  }, {
    key: "registerProperty",
    value: function registerProperty(id, description) {
      Object.defineProperty(this._marty, id, description);
    }
  }, {
    key: "register",
    value: function register(id, value) {
      this._marty[id] = value;
    }
  }]);

  return MartyBuilder;
})();

module.exports = MartyBuilder;
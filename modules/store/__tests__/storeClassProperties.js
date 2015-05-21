'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;

var _require = require('../../test-utils');

var dispatch = _require.dispatch;

var buildMarty = require('../../../test/lib/buildMarty');

describe('Store statics', function () {
  var app = undefined,
      Marty = undefined,
      handler = undefined;

  beforeEach(function () {
    Marty = buildMarty();
    handler = sinon.stub();
  });

  describe('when class properties', function () {
    beforeEach(function () {
      var UserStore = (function (_Marty$Store) {
        function UserStore() {
          _classCallCheck(this, UserStore);

          if (_Marty$Store != null) {
            _Marty$Store.apply(this, arguments);
          }

          this.handlers = {
            actionHandler: ['FOO', 'BAR']
          };
        }

        _inherits(UserStore, _Marty$Store);

        _createClass(UserStore, [{
          key: 'actionHandler',
          value: function actionHandler(foo, bar) {
            handler(foo, bar);
          }
        }]);

        return UserStore;
      })(Marty.Store);

      app = new Marty.Application();
      app.register('store', UserStore);

      dispatch(app, 'FOO', 1, 2);
      dispatch(app, 'BAR', 'a', 'b');
    });

    it('should handle the dispatched actions', function () {
      expect(handler).to.be.calledWith(1, 2);
      expect(handler).to.be.calledWith('a', 'b');
    });
  });

  describe('when static properties', function () {
    beforeEach(function () {
      var UserStore = (function (_Marty$Store2) {
        function UserStore() {
          _classCallCheck(this, UserStore);

          if (_Marty$Store2 != null) {
            _Marty$Store2.apply(this, arguments);
          }
        }

        _inherits(UserStore, _Marty$Store2);

        _createClass(UserStore, [{
          key: 'actionHandler',
          value: function actionHandler(foo, bar) {
            handler(foo, bar);
          }
        }]);

        return UserStore;
      })(Marty.Store);

      UserStore.handlers = {
        actionHandler: ['FOO', 'BAR']
      };

      app = new Marty.Application();
      app.register('store', UserStore);

      dispatch(app, 'FOO', 1, 2);
      dispatch(app, 'BAR', 'a', 'b');
    });

    it('should handle the dispatched actions', function () {
      expect(handler).to.be.calledWith(1, 2);
      expect(handler).to.be.calledWith('a', 'b');
    });
  });
});
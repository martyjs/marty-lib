'use strict';

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;

var _require = require('../../test-utils');

var dispatch = _require.dispatch;

var buildMarty = require('../../../test/lib/buildMarty');

describe('@handles', function () {
  var app = undefined,
      Marty = undefined,
      handler = undefined;

  beforeEach(function () {
    Marty = buildMarty();
    handler = sinon.stub();

    var UserStore = (function (_Marty$Store) {
      function UserStore() {
        _classCallCheck(this, UserStore);

        if (_Marty$Store != null) {
          _Marty$Store.apply(this, arguments);
        }
      }

      _inherits(UserStore, _Marty$Store);

      _createDecoratedClass(UserStore, [{
        key: 'actionHandler',
        decorators: [Marty.handles('FOO', 'BAR')],
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
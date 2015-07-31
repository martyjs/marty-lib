'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var sinon = require('sinon');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var UnknownStoreError = require('../../errors/unknownStoreError');

describe('Application#rehydrate()', function () {
  var serverApp, browserApp;
  var store1ExpectedState, store2ExpectedState, dehydratedState, Marty;

  beforeEach(function () {
    Marty = buildMarty();
    store2ExpectedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };

    var App = (function (_Marty$Application) {
      _inherits(App, _Marty$Application);

      function App() {
        _classCallCheck(this, App);

        _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);

        this.register({
          store1: Marty.createStore({
            getInitialState: function getInitialState() {
              return {};
            },
            rehydrate: sinon.spy(function (state) {
              this.replaceState(state);
            })
          }),
          store2: Marty.createStore({
            getInitialState: function getInitialState() {
              return {};
            },
            rehydrate: sinon.spy(function (state) {
              this.replaceState(state);
            })
          })
        });
      }

      return App;
    })(Marty.Application);

    serverApp = new App();
    browserApp = new App();

    serverApp.replaceState({
      store1: store1ExpectedState,
      store2: store2ExpectedState
    });

    dehydratedState = serverApp.dehydrate();
  });

  afterEach(function () {
    window.__marty = null;
  });

  describe('when you pass in the state', function () {
    describe('when you pass in state for an unknown store', function () {
      it('should throw an UnknownStoreError', function () {
        expect(function () {
          browserApp.rehydrate({ foo: {} });
        }).to['throw'](UnknownStoreError);
      });
    });

    describe('when you pass in state for a known store', function () {
      var store1State, store2State, expectedFetchId;

      beforeEach(function () {
        expectedFetchId = 'foo';
        store1State = { foo: 'bar' };
        store2State = { bar: 'baz' };

        browserApp.rehydrate({
          store1: {
            state: store1State,
            fetchHistory: _defineProperty({}, expectedFetchId, true)
          },
          store2: {
            state: store2State,
            fetchHistory: _defineProperty({}, expectedFetchId, true)
          }
        });
      });

      it('should set the stores fetchHistory', function () {
        expect(browserApp.store1.hasAlreadyFetched(expectedFetchId)).to.be['true'];
        expect(browserApp.store2.hasAlreadyFetched(expectedFetchId)).to.be['true'];
      });

      it('should set the state of the store', function () {
        expect(browserApp.store1.state).to.equal(store1State);
        expect(browserApp.store2.state).to.equal(store2State);
      });
    });
  });

  describe('when there is state on the window object', function () {
    beforeEach(function () {
      // TODO: Remove code-based implementation of dehydrate.
      eval(dehydratedState.toString()); // jshint ignore:line
      browserApp.rehydrate();
    });

    it('should set the stores initial state based on the serialized state', function () {
      expect(browserApp.store1.state).to.eql(store1ExpectedState);
      expect(browserApp.store2.state).to.eql(store2ExpectedState);
    });
  });

  describe('when there is only state for some stores', function () {
    beforeEach(function () {
      delete dehydratedState.store1;
      // TODO: Remove code-based implementation of dehydrate.
      eval(dehydratedState.toString()); // jshint ignore:line
      browserApp.rehydrate();
    });

    it('should only call `rehydrate` for stores it knows about', function () {
      expect(browserApp.store1.rehydrate).to.not.be.called;
      expect(browserApp.store2.rehydrate).to.be.calledWith(store2ExpectedState);
    });
  });
});
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;
var ActionPayload = require('../../core/actionPayload');
var buildMarty = require('../../../test/lib/buildMarty');
var stubbedLogger = require('../../../test/lib/stubbedLogger');
var describeStyles = require('../../../test/lib/describeStyles');
var ActionHandlerNotFoundError = require('../../errors/actionHandlerNotFoundError');
var ActionPredicateUndefinedError = require('../../errors/actionPredicateUndefinedError');

describeStyles('Store', function (styles, currentStyle) {
  var store,
      changeListener,
      listener,
      dispatcher,
      dispatchToken = 'foo',
      initialState = {};
  var actualAction, actualChangeListenerFunctionContext, expectedChangeListenerFunctionContext;
  var expectedError, logger, Marty, app;

  beforeEach(function () {
    Marty = buildMarty();

    app = new Marty.Application();
    logger = stubbedLogger();
    dispatcher = {
      register: sinon.stub().returns(dispatchToken),
      unregister: sinon.spy()
    };

    expectedError = new Error('foo');

    var handlers = {
      error: 'ERROR',
      one: 'one-action',
      multiple: ['multi-1-action', 'multi-2-action']
    };

    var proto = {
      where: sinon.spy(),
      multiple: sinon.spy(),
      initialize: sinon.spy(),
      whereAndAction: sinon.spy(),
      error: sinon.stub().throws(expectedError),
      getInitialState: sinon.stub().returns(initialState),
      one: sinon.spy(function () {
        actualAction = this.action;
      })
    };

    var Store = styles({
      classic: function classic() {
        return Marty.createStore(_.extend({
          id: 'test',
          handlers: handlers,
          dispatcher: dispatcher,
          displayName: 'TestStore'
        }, proto));
      },
      es6: function es6() {
        var TestStore = (function (_Marty$Store) {
          _inherits(TestStore, _Marty$Store);

          function TestStore(options) {
            _classCallCheck(this, TestStore);

            _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).call(this, options);
            this.handlers = handlers;
            this.state = initialState;
            this.displayName = 'TestStore';
          }

          return TestStore;
        })(Marty.Store);

        _.extend(TestStore.prototype, _.omit(proto, 'getInitialState'));

        return TestStore;
      }
    });

    store = new Store({
      app: {
        dispatcher: dispatcher
      }
    });

    expectedChangeListenerFunctionContext = {};
    listener = sinon.spy(function () {
      actualChangeListenerFunctionContext = this;
    });
    changeListener = store.addChangeListener(listener, expectedChangeListenerFunctionContext);
  });

  afterEach(function () {
    logger.restore();
  });

  it('should have a dispatch token', function () {
    expect(store.dispatchToken).to.equal(dispatchToken);
  });

  it('should have registered handleAction with the dispatcher', function () {
    expect(dispatcher.register).to.have.been.called;
  });

  if (currentStyle === 'classic') {

    describe('#mixins', function () {
      describe('when you have multiple mixins', function () {
        var mixin1, mixin2;

        beforeEach(function () {
          mixin1 = {
            foo: function foo() {
              return 'bar';
            }
          };

          mixin2 = {
            bar: function bar() {
              return 'baz';
            }
          };

          app.register('multipleMixins', Marty.createStore({
            id: 'multiple-mixins',
            dispatcher: dispatcher,
            getInitialState: _.noop,
            mixins: [mixin1, mixin2]
          }));
        });

        it('should allow you to mixin object literals', function () {
          expect(app.multipleMixins.foo()).to.equal('bar');
          expect(app.multipleMixins.bar()).to.equal('baz');
        });
      });

      describe('when the mixin has handlers', function () {
        var handlerMixin;

        beforeEach(function () {
          handlerMixin = {
            handlers: {
              baz: 'BAZ'
            },
            baz: _.noop
          };

          app.register('mixinHandlers', Marty.createStore({
            id: 'mixin-with-handlers',
            dispatcher: dispatcher,
            handlers: {
              foo: 'FOO',
              bar: 'BAR'
            },
            getInitialState: _.noop,
            mixins: [handlerMixin],
            foo: _.noop,
            bar: _.noop
          }));
        });

        it('should do a deep merge', function () {
          expect(app.mixinHandlers.handlers).to.include.keys('foo', 'bar', 'baz');
        });
      });
    });

    describe('#getInitialState()', function () {
      it('should be called once', function () {
        expect(store.getInitialState).to.have.been.calledOnce;
      });

      it('should set the stores state to the initial state', function () {
        expect(store.state).to.equal(initialState);
      });
    });
  }

  describe('when you pass in an application', function () {
    var application;

    beforeEach(function () {
      var App = (function (_Marty$Application) {
        _inherits(App, _Marty$Application);

        function App() {
          _classCallCheck(this, App);

          _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
          this.register('store', (function (_Marty$Store2) {
            _inherits(Store, _Marty$Store2);

            function Store() {
              _classCallCheck(this, Store);

              _get(Object.getPrototypeOf(Store.prototype), 'constructor', this).apply(this, arguments);
            }

            return Store;
          })(Marty.Store));
        }

        return App;
      })(Marty.Application);

      application = new App();
    });

    it('should be accessible on the object', function () {
      expect(application.store.app).to.equal(application);
    });
  });

  describe('when the store updates multiple times during a dispatch', function () {
    beforeEach(function () {
      app.register('multipleUpdatesStore', Marty.createStore({
        handlers: {
          foo: 'FOO'
        },
        foo: function foo() {
          this.hasChanged();
          this.hasChanged();
          this.hasChanged();
        }
      }));

      changeListener = sinon.spy();

      app.multipleUpdatesStore.addChangeListener(changeListener);

      app.dispatcher.dispatchAction({
        type: 'FOO',
        arguments: []
      });
    });

    it('should only notify components once at the end of the dispatch', function () {
      expect(changeListener).to.be.calledOnce;
    });
  });

  describe('#state', function () {
    var newState;
    beforeEach(function () {
      newState = {};
      store.state = newState;
    });

    it('should update the state', function () {
      expect(store.state).to.equal(newState);
    });

    it('should call the change listener with the new state', function () {
      expect(listener).to.have.been.calledWith(newState);
    });
  });

  describe('#replaceState()', function () {
    describe('when the state has changed', function () {
      var newState;
      beforeEach(function () {
        newState = {};
        store.replaceState(newState);
      });

      it('should update the state', function () {
        expect(store.state).to.equal(newState);
      });

      it('should call the change listener with the new state', function () {
        expect(listener).to.have.been.calledWith(newState);
      });
    });

    describe('when the state has not changed', function () {
      beforeEach(function () {
        store.replaceState(store.state);
      });

      it('should not call the change linstener', function () {
        expect(listener).to.not.have.been.called;
      });
    });
  });

  describe('#setState()', function () {
    var initialState, newState;

    beforeEach(function () {
      initialState = { foo: 'bar' };
      store.replaceState(initialState);
    });

    describe('when the passed in value is an object', function () {
      beforeEach(function () {
        newState = {
          bam: 1
        };

        store.setState(_.clone(newState));
      });

      it('should merge in the state', function () {
        expect(store.state).to.eql(_.extend({}, initialState, newState));
      });
    });
  });

  describe('#addChangeListener()', function () {

    beforeEach(function () {
      store.hasChanged();
    });

    it('should call the change listener', function () {
      expect(listener).to.have.been.calledOnce;
    });

    it('should pass the state and store as the arguments', function () {
      expect(listener).to.have.been.calledWith(store.state, store);
    });

    it('should set the callbacks function context', function () {
      expect(actualChangeListenerFunctionContext).to.equal(expectedChangeListenerFunctionContext);
    });

    describe('#dispose()', function () {
      beforeEach(function () {
        changeListener.dispose();
        store.hasChanged();
      });

      it('should NOT call the change listener', function () {
        expect(listener).to.have.been.calledOnce;
      });
    });
  });

  describe('#dispose()', function () {
    var _clear;

    beforeEach(function () {
      _clear = sinon.spy();
    });

    describe('when you dont pass in a dispose function', function () {
      var disposeStore;

      beforeEach(function () {
        var Store = styles({
          classic: function classic() {
            return Marty.createStore({
              clear: _clear,
              getInitialState: function getInitialState() {
                return {};
              }
            });
          },
          es6: function es6() {
            var TestStore = (function (_Marty$Store3) {
              _inherits(TestStore, _Marty$Store3);

              function TestStore() {
                _classCallCheck(this, TestStore);

                _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
              }

              return TestStore;
            })(Marty.Store);

            TestStore.prototype.clear = _clear;

            return TestStore;
          }
        });

        disposeStore = new Store({
          app: {
            dispatcher: dispatcher
          }
        });

        disposeStore.addChangeListener(listener);
        disposeStore.hasChanged();
        disposeStore.dispose();
        disposeStore.hasChanged();
      });

      it('should call clear', function () {
        expect(_clear).to.have.been.calledOnce;
      });

      it('should dispose of all listeners', function () {
        expect(listener).to.have.been.calledOnce;
      });

      it('should call unregister with dispatchToken', function () {
        expect(dispatcher.unregister).to.have.been.calledWith(dispatchToken);
      });

      it('should make store.dispatchToken undefined', function () {
        expect(disposeStore.dispatchToken).to.be.undefined;
      });
    });

    describe('when you pass in a dispose function', function () {
      var _dispose;

      beforeEach(function () {
        _dispose = sinon.spy();
        var Store = styles({
          classic: function classic() {
            return Marty.createStore({
              id: 'dispose',
              clear: _clear,
              dispose: _dispose,
              getInitialState: function getInitialState() {
                return {};
              }
            });
          },
          es6: function es6() {
            var TestStore = (function (_Marty$Store4) {
              _inherits(TestStore, _Marty$Store4);

              function TestStore(options) {
                _classCallCheck(this, TestStore);

                _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).call(this, options);
                this.state = {};
              }

              _createClass(TestStore, [{
                key: 'clear',
                value: function clear() {
                  _get(Object.getPrototypeOf(TestStore.prototype), 'clear', this).call(this);
                  _clear();
                }
              }, {
                key: 'dispose',
                value: function dispose() {
                  _get(Object.getPrototypeOf(TestStore.prototype), 'dispose', this).call(this);
                  _dispose();
                }
              }]);

              return TestStore;
            })(Marty.Store);

            return TestStore;
          }
        });

        var store = new Store({
          app: {
            dispatcher: dispatcher
          }
        });

        store.addChangeListener(listener);
        store.hasChanged();
        store.dispose();
        store.hasChanged();
      });

      it('should call the dispose function', function () {
        expect(_dispose).to.have.been.calledOnce;
      });

      it('should call clear', function () {
        expect(_clear).to.have.been.calledOnce;
      });

      it('should dispose of all listeners', function () {
        expect(listener).to.have.been.calledOnce;
      });

      it('should call unregister with dispatchToken', function () {
        expect(dispatcher.unregister).to.have.been.calledWith(dispatchToken);
      });
    });
  });

  describe('#handlers', function () {
    describe('when the action handler is null', function () {
      it('should throw an ActionHandlerNotFoundError', function () {
        expect(createStoreWithMissingActionHandler).to['throw'](ActionHandlerNotFoundError);

        function createStoreWithMissingActionHandler() {
          var Store = styles({
            classic: function classic() {
              return Marty.createStore({
                id: 'createStoreWithMissingActionHandler',
                dispatcher: dispatcher,
                handlers: {
                  foo: 'FOO'
                }
              });
            },
            es6: function es6() {
              var TestStore = (function (_Marty$Store5) {
                _inherits(TestStore, _Marty$Store5);

                function TestStore(options) {
                  _classCallCheck(this, TestStore);

                  _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).call(this, options);
                  this.state = {};
                  this.handlers = {
                    foo: 'FOO'
                  };
                }

                return TestStore;
              })(Marty.Store);

              return TestStore;
            }
          });

          store = new Store({
            app: {
              dispatcher: dispatcher
            }
          });

          store.handleAction();
        }
      });
    });

    describe('when the handler action predicate is null', function () {
      it('should throw an ActionPredicateUndefinedError', function () {
        expect(createStoreWithANullActionPredicate).to['throw'](ActionPredicateUndefinedError);

        function createStoreWithANullActionPredicate() {
          var Store = styles({
            classic: function classic() {
              return Marty.createStore({
                id: 'createStoreWithANullActionPredicate',
                handlers: {
                  foo: null
                },
                foo: _.noop
              });
            },
            es6: function es6() {
              var TestStore = (function (_Marty$Store6) {
                _inherits(TestStore, _Marty$Store6);

                function TestStore(options) {
                  _classCallCheck(this, TestStore);

                  _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).call(this, options);
                  this.state = {};
                  this.handlers = {
                    foo: null
                  };
                }

                return TestStore;
              })(Marty.Store);

              return TestStore;
            }
          });

          store = new Store({
            app: {
              dispatcher: dispatcher
            }
          });

          store.handleAction();
        }
      });
    });
  });

  describe('#waitFor()', function () {
    var actualResult, expectedResult, executionOrder;

    beforeEach(function () {
      executionOrder = [];
      expectedResult = 6;
    });

    describe('when I pass in an array of stores', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor([app.store3, app.store2]);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    describe('when I pass in stores as arguments', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor(app.store3, app.store2);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    describe('when I pass in dispatch tokens', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor(app.store3.dispatchToken, app.store2.dispatchToken);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    function waitFor(waitForCb) {
      var order = [];

      styles({
        classic: function classic() {
          app.register('testActionCreators', Marty.createActionCreators({
            sum: function sum() {
              this.dispatch('SUM', 2);
            }
          }));

          app.register('store2', Marty.createStore({
            handlers: { sum: 'SUM' },
            getInitialState: function getInitialState() {
              return 0;
            },
            sum: function sum(value) {
              this.waitFor(this.app.store3);
              this.state += this.app.store3.getState() + value;
              order.push('store2');
            }
          }));

          app.register('store1', Marty.createStore({
            handlers: { sum: 'SUM' },
            getInitialState: function getInitialState() {
              return 0;
            },
            sum: function sum(value) {
              waitForCb(this);
              this.state = this.app.store2.getState() + value;
              order.push('store1');
            }
          }));

          app.register('store3', Marty.createStore({
            handlers: { sum: 'SUM' },
            getInitialState: function getInitialState() {
              return 0;
            },
            sum: function sum(value) {
              this.state += value;
              order.push('store3');
            }
          }));
        },
        es6: function es6() {
          var TestActionCreators = (function (_Marty$ActionCreators) {
            _inherits(TestActionCreators, _Marty$ActionCreators);

            function TestActionCreators() {
              _classCallCheck(this, TestActionCreators);

              _get(Object.getPrototypeOf(TestActionCreators.prototype), 'constructor', this).apply(this, arguments);
            }

            _createClass(TestActionCreators, [{
              key: 'sum',
              value: function sum() {
                this.dispatch('SUM', 2);
              }
            }]);

            return TestActionCreators;
          })(Marty.ActionCreators);

          var Store1 = (function (_Marty$Store7) {
            _inherits(Store1, _Marty$Store7);

            function Store1(options) {
              _classCallCheck(this, Store1);

              _get(Object.getPrototypeOf(Store1.prototype), 'constructor', this).call(this, options);
              this.state = 0;
              this.handlers = { sum: 'SUM' };
            }

            _createClass(Store1, [{
              key: 'sum',
              value: function sum(value) {
                waitForCb(this);
                this.state = this.app.store2.getState() + value;
                order.push('store1');
              }
            }]);

            return Store1;
          })(Marty.Store);

          var Store2 = (function (_Marty$Store8) {
            _inherits(Store2, _Marty$Store8);

            function Store2(options) {
              _classCallCheck(this, Store2);

              _get(Object.getPrototypeOf(Store2.prototype), 'constructor', this).call(this, options);
              this.state = 0;
              this.handlers = { sum: 'SUM' };
            }

            _createClass(Store2, [{
              key: 'sum',
              value: function sum(value) {
                this.waitFor(this.app.store3);
                this.state += this.app.store3.getState() + value;
                order.push('store2');
              }
            }]);

            return Store2;
          })(Marty.Store);

          var Store3 = (function (_Marty$Store9) {
            _inherits(Store3, _Marty$Store9);

            function Store3(options) {
              _classCallCheck(this, Store3);

              _get(Object.getPrototypeOf(Store3.prototype), 'constructor', this).call(this, options);
              this.state = 0;
              this.handlers = { sum: 'SUM' };
            }

            _createClass(Store3, [{
              key: 'sum',
              value: function sum(value) {
                this.state += value;
                order.push('store3');
              }
            }]);

            return Store3;
          })(Marty.Store);

          app.register('store2', Store2);
          app.register('store1', Store1);
          app.register('store3', Store3);
          app.register('testActionCreators', TestActionCreators);
        }
      });

      app.testActionCreators.sum();
      actualResult = app.store1.getState();

      return order;
    }
  });

  describe('#handleAction()', function () {
    var data = {},
        expectedAction;

    describe('when the store does not handle action type', function () {
      beforeEach(function () {
        handleAction('foo');
      });

      it('should not call any handlers', function () {
        expect(store.one).to.not.have.been.called;
        expect(store.multiple).to.not.have.been.called;
      });
    });

    describe('when the store has one action type for a handler', function () {
      beforeEach(function () {
        expectedAction = handleAction('one-action');
      });

      it('should call the action handler', function () {
        expect(store.one).to.have.been.calledOnce;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.one).to.have.been.calledWith(data);
      });

      it('should make the action accessible in the function context', function () {
        expect(actualAction).to.equal(expectedAction);
      });
    });

    describe('when the store has multiple action types for a handler', function () {
      beforeEach(function () {
        handleAction('multi-1-action');
        handleAction('multi-2-action');
      });

      it('should call the action handler', function () {
        expect(store.multiple).to.have.been.calledTwice;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.multiple).to.have.been.calledWith(data);
      });
    });

    function handleAction(actionType) {
      var action = new ActionPayload({
        type: actionType,
        arguments: [data]
      });

      store.handleAction(action);

      return action;
    }
  });

  describe('#clear()', function () {
    describe('when you do not pass in a clear function', function () {
      var initialState;

      beforeEach(function () {
        initialState = {
          foo: 'foo'
        };

        app.register('clearStore', styles({
          classic: function classic() {
            return Marty.createStore({
              getInitialState: function getInitialState() {
                return initialState;
              }
            });
          },
          es6: function es6() {
            return (function (_Marty$Store10) {
              _inherits(ClearStore, _Marty$Store10);

              function ClearStore() {
                _classCallCheck(this, ClearStore);

                _get(Object.getPrototypeOf(ClearStore.prototype), 'constructor', this).apply(this, arguments);
              }

              _createClass(ClearStore, [{
                key: 'getInitialState',
                value: function getInitialState() {
                  return initialState;
                }
              }]);

              return ClearStore;
            })(Marty.Store);
          }
        }));

        app.clearStore.setState({
          foo: 'bar'
        });

        app.clearStore.clear();
      });

      it('should replace the state with the original state', function () {
        expect(app.clearStore.state).to.eql(initialState);
      });

      it('should clear the fetchHistory', function () {
        var fetchId = 'foo';
        app.clearStore.fetch(fetchId, function () {
          return {};
        });

        expect(app.clearStore.hasAlreadyFetched(fetchId)).to.be['true'];

        app.clearStore.clear();

        expect(app.clearStore.hasAlreadyFetched(fetchId)).to.be['false'];
      });
    });

    describe('when you pass in a clear function', function () {
      var _clear2;

      beforeEach(function () {
        _clear2 = sinon.spy();
        app.register('clearStore', styles({
          classic: function classic() {
            return Marty.createStore({
              clear: _clear2,
              getInitialState: function getInitialState() {
                return {};
              }
            });
          },
          es6: function es6() {
            return (function (_Marty$Store11) {
              _inherits(ClearStore, _Marty$Store11);

              function ClearStore(options) {
                _classCallCheck(this, ClearStore);

                _get(Object.getPrototypeOf(ClearStore.prototype), 'constructor', this).call(this, options);
                this.state = {};
              }

              _createClass(ClearStore, [{
                key: 'clear',
                value: function clear() {
                  _clear2();
                  _get(Object.getPrototypeOf(ClearStore.prototype), 'clear', this).call(this);
                }
              }]);

              return ClearStore;
            })(Marty.Store);
          }
        }));

        app.clearStore.setState({ foo: 'bar' });
        app.clearStore.clear();
      });

      it('should call the clear function', function () {
        expect(_clear2).to.have.been.calledOnce;
      });

      it('should replace the state with the original state', function () {
        expect(app.clearStore.state).to.eql({});
      });
    });
  });
});
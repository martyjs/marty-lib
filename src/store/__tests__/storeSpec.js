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
  var store, changeListener, listener, dispatcher, dispatchToken = 'foo', initialState = {};
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
      classic: function () {
        return Marty.createStore(_.extend({
          id: 'test',
          handlers: handlers,
          dispatcher: dispatcher,
          displayName: 'TestStore'
        }, proto));
      },
      es6: function () {
        class TestStore extends Marty.Store {
          constructor(options) {
            super(options);
            this.handlers = handlers;
            this.state = initialState;
            this.displayName = 'TestStore';
          }
        }

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
            foo: function () { return 'bar'; }
          };

          mixin2 = {
            bar: function () { return 'baz'; }
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
      class App extends Marty.Application {
        constructor() {
          super();
          this.register('store', class Store extends Marty.Store {});
        }
      }

      application = new App();
    });

    it('should be accessible on the object', function () {
      expect(application.store.app).to.equal(application);
    });
  });

  describe('when the store updates multiple times during a dispatch', function () {
    beforeEach(function () {
      var dispatcher = Marty.dispatcher;

      app.register('multipleUpdatesStore', Marty.createStore({
        handlers: {
          foo: 'FOO'
        },
        foo: function () {
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
    var clear;

    beforeEach(function () {
      clear = sinon.spy();
    });

    describe('when you dont pass in a dispose function', function () {
      var disposeStore;

      beforeEach(function () {
        var Store = styles({
          classic: function () {
            return Marty.createStore({
              clear: clear,
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            class TestStore extends Marty.Store {
            }

            TestStore.prototype.clear = clear;

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
        expect(clear).to.have.been.calledOnce;
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
      var dispose;

      beforeEach(function () {
        dispose = sinon.spy();
        var Store = styles({
          classic: function () {
            return Marty.createStore({
              id: 'dispose',
              clear: clear,
              dispose: dispose,
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            class TestStore extends Marty.Store {
              constructor(options) {
                super(options);
                this.state = {};
              }
              clear() {
                super.clear();
                clear();
              }
              dispose() {
                super.dispose();
                dispose();
              }
            }

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
        expect(dispose).to.have.been.calledOnce;
      });

      it('should call clear', function () {
        expect(clear).to.have.been.calledOnce;
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
        expect(createStoreWithMissingActionHandler).to.throw(ActionHandlerNotFoundError);

        function createStoreWithMissingActionHandler() {
          var Store = styles({
            classic: function () {
              return Marty.createStore({
                id: 'createStoreWithMissingActionHandler',
                dispatcher: dispatcher,
                handlers: {
                  foo: 'FOO'
                }
              });
            },
            es6: function () {
              class TestStore extends Marty.Store {
                constructor(options) {
                  super(options);
                  this.state = {};
                  this.handlers = {
                    foo: 'FOO'
                  };
                }
              }

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
        expect(createStoreWithANullActionPredicate).to.throw(ActionPredicateUndefinedError);

        function createStoreWithANullActionPredicate() {
          var Store = styles({
            classic: function () {
              return Marty.createStore({
                id: 'createStoreWithANullActionPredicate',
                handlers: {
                  foo: null
                },
                foo: _.noop
              });
            },
            es6: function () {
              class TestStore extends Marty.Store {
                constructor(options) {
                  super(options);
                  this.state = {};
                  this.handlers = {
                    foo: null
                  };
                }
              }

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
        classic: function () {
          app.register('testActionCreators', Marty.createActionCreators({
            sum: function () {
              this.dispatch('SUM', 2);
            }
          }));

          app.register('store2', Marty.createStore({
            handlers: { sum: 'SUM'},
            getInitialState: function () {
              return 0;
            },
            sum: function (value) {
              this.waitFor(this.app.store3);
              this.state += this.app.store3.getState() + value;
              order.push('store2');
            }
          }));

          app.register('store1', Marty.createStore({
            handlers: { sum: 'SUM'},
            getInitialState: function () {
              return 0;
            },
            sum: function (value) {
              waitForCb(this);
              this.state = this.app.store2.getState() + value;
              order.push('store1');
            }
          }));

          app.register('store3', Marty.createStore({
            handlers: { sum: 'SUM'},
            getInitialState: function () {
              return 0;
            },
            sum: function (value) {
              this.state += value;
              order.push('store3');
            }
          }));
        },
        es6: function () {
          class TestActionCreators extends Marty.ActionCreators {
            sum() {
              this.dispatch('SUM', 2);
            }
          }

          class Store1 extends Marty.Store {
            constructor(options) {
              super(options);
              this.state = 0;
              this.handlers = { sum: 'SUM'};
            }
            sum(value) {
              waitForCb(this);
              this.state = this.app.store2.getState() + value;
              order.push('store1');
            }
          }

          class Store2 extends Marty.Store {
            constructor(options) {
              super(options);
              this.state = 0;
              this.handlers = { sum: 'SUM'};
            }
            sum(value) {
              this.waitFor(this.app.store3);
              this.state += this.app.store3.getState() + value;
              order.push('store2');
            }
          }

          class Store3 extends Marty.Store {
            constructor(options) {
              super(options);
              this.state = 0;
              this.handlers = { sum: 'SUM'};
            }
            sum(value) {
              this.state += value;
              order.push('store3');
            }
          }

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
    var data = {}, expectedAction;

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
          classic: function () {
            return Marty.createStore({
              getInitialState: function () {
                return initialState;
              }
            });
          },
          es6: function () {
            return class ClearStore extends Marty.Store {
              getInitialState() {
                return initialState;
              }
            }
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
        app.clearStore.fetch(fetchId, function () { return {}; });

        expect(app.clearStore.hasAlreadyFetched(fetchId)).to.be.true;

        app.clearStore.clear();

        expect(app.clearStore.hasAlreadyFetched(fetchId)).to.be.false;
      });
    });

    describe('when you pass in a clear function', function () {
      var clear;

      beforeEach(function () {
        clear = sinon.spy();
        app.register('clearStore', styles({
          classic: function () {
            return Marty.createStore({
              clear: clear,
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            return class ClearStore extends Marty.Store {
              constructor(options) {
                super(options);
                this.state = {};
              }
              clear() {
                clear();
                super.clear();
              }
            }
          }
        }));

        app.clearStore.setState({ foo: 'bar'});
        app.clearStore.clear();
      });

      it('should call the clear function', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should replace the state with the original state', function () {
        expect(app.clearStore.state).to.eql({});
      });
    });
  });
});

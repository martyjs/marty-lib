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

    class App extends Marty.Application {
      constructor() {
        super();

        this.register({
          store1: Marty.createStore({
            getInitialState: function () {
              return {};
            },
            rehydrate: sinon.spy(function (state) {
              this.replaceState(state);
            })
          }),
          store2: Marty.createStore({
            getInitialState: function () {
              return {};
            },
            rehydrate: sinon.spy(function (state) {
              this.replaceState(state);
            })
          })
        });
      }
    }

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
          browserApp.rehydrate({foo: {}});
        }).to.throw(UnknownStoreError);
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
            fetchHistory: {
              [expectedFetchId]: true
            }
          },
          store2: {
            state: store2State,
            fetchHistory: {
              [expectedFetchId]: true
            }
          }
        });
      });

      it('should set the stores fetchHistory', function () {
        expect(browserApp.store1.hasAlreadyFetched(expectedFetchId)).to.be.true;
        expect(browserApp.store2.hasAlreadyFetched(expectedFetchId)).to.be.true;
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

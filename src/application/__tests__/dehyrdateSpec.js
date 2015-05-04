var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

describe('Application#dehydrate()', function () {
  var Marty, store1ExpectedState, storeSerializedState, serializedState, expectedFetchId;

  beforeEach(function () {
    Marty = buildMarty();
    expectedFetchId = 'FETCH';
    storeSerializedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };

    class Store1 extends Marty.Store {
      dehydrate() {
        return store1ExpectedState;
      }
      testFetch () {
        this.fetch({
          id: expectedFetchId,
          locally() {
            return { foo: 'bar' };
          }
        });
      }
    }

    class Store2 extends Marty.Store {
      dehydrate() {
        return storeSerializedState;
      }
    }

    class Store3 extends Marty.Store {
      testFetch () {
        this.fetch({
          id: expectedFetchId,
          locally() {
            return { foo: 'bar' };
          }
        });
      }
    }

    var app = new Marty.Application();

    app.register('Store1', Store1);
    app.register('Store2', Store2);
    app.register('Store3', Store3);

    app.Store1.testFetch();
    app.Store3.testFetch();

    serializedState = app.dehydrate();
  });

  it('should serialze all the stores', function () {
    expect(serializedState.toJSON()).to.eql({
      Store1: {
        fetchHistory: {
          [expectedFetchId]: true
        },
        state: store1ExpectedState
      },
      Store2: {
        fetchHistory: {},
        state: storeSerializedState
      },
      Store3: {
        fetchHistory: {
          [expectedFetchId]: true
        },
        state: {}
      }
    });
  });

  describe('#toString()', function () {
    it('should create a string that can be injected into the page', function () {
      expect(serializedState.toString()).to.equal('(window.__marty||(window.__marty={})).stores=' + JSON.stringify({
        Store1: {
          fetchHistory: {
            [expectedFetchId]: true
          },
          state: store1ExpectedState
        },
        Store2: {
          fetchHistory: {},
          state: storeSerializedState
        },
        Store3: {
          fetchHistory: {
            [expectedFetchId]: true
          },
          state: {}
        }
      }));
    });
  });
});
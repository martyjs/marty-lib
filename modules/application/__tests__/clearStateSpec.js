var expect = require('chai').expect;
var buildMarty = require('./buildMarty');

describe('Application#clearState()', function () {
  var Marty, Store1, Store2, app;

  beforeEach(function () {
    Marty = buildMarty();
    Store1 = Marty.createStore({
      getInitialState: function () {
        return {};
      }
    });

    Store2 = Marty.createStore({
      getInitialState: function () {
        return {};
      }
    });

    app = new Marty.Application();
    app.register('clearState1', Marty.Store);
    app.register('clearState2', Marty.Store);

    app.replaceState({
      clearState1: { foo: 'bar' },
      clearState2: { bar: 'baz' }
    });

    app.clearState();
  });

  it('should reset the store state to its initial state', function () {
    expect(app.clearState1.getState()).to.eql({});
    expect(app.clearState2.getState()).to.eql({});
  });
});


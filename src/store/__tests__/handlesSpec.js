let _ = require('lodash');
let sinon = require('sinon');
let expect = require('chai').expect;
let { dispatch } = require('../../test-utils');
let buildMarty = require('../../../test/lib/buildMarty');

describe('@handles', () => {
  let app, Marty, handler;

  beforeEach(() => {
    Marty = buildMarty();
    handler = sinon.stub();

    class UserStore extends Marty.Store {
      @Marty.handles('FOO', 'BAR')
      actionHandler(foo, bar) {
        handler(foo, bar);
      }
    }

    app = new Marty.Application();
    app.register('store', UserStore);

    dispatch(app, 'FOO', 1, 2);
    dispatch(app, 'BAR', 'a', 'b');
  });

  it('should handle the dispatched actions', () => {
    expect(handler).to.be.calledWith(1, 2);
    expect(handler).to.be.calledWith('a', 'b');
  });
});
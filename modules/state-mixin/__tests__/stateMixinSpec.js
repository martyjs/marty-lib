'use strict';

var React = require('react');
var sinon = require('sinon');
var expect = require('chai').expect;
var uuid = require('../../core/utils/uuid');
var Diagnostics = require('../../core/diagnostics');
var ActionPayload = require('../../core/actionPayload');
var buildMarty = require('../../../test/lib/buildMarty');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

describe('StateMixin', function () {
  var element, sandbox, mixin, initialState, Marty, app, state, componentFunctionContext;

  beforeEach(function () {
    Marty = buildMarty();
    app = new Marty.Application();
    sandbox = sinon.sandbox.create();
    initialState = {
      name: 'hello'
    };
    Diagnostics.devtoolsEnabled = true;

    mixin = Marty.createStateMixin({
      getInitialState: function getInitialState() {
        return initialState;
      }
    });
  });

  afterEach(function () {
    Diagnostics.devtoolsEnabled = false;
    sandbox.restore();
  });

  describe('when a store changes', function () {
    var expectedState, expectedId, action, log;

    beforeEach(function () {
      expectedId = '123';
      sandbox.stub(uuid, 'small').returns(expectedId);
      action = new ActionPayload();
      expectedState = {};
      log = console.log;
      console.log = function () {};
      app.register('store', Marty.createStore({
        action: action,
        displayName: 'Store Changes',
        addChangeListener: sinon.spy(),
        getInitialState: function getInitialState() {
          return {};
        },
        getState: sinon.stub().returns(expectedState)
      }));

      mixin = Marty.createStateMixin({
        listenTo: 'store',
        getState: function getState() {
          return this.app.store.getState();
        }
      });

      action.addStoreHandler(app.store, 'test');
      element = renderClassWithMixin(mixin);
    });

    afterEach(function () {
      console.log = log;
    });
  });

  describe('when the component unmounts', function () {
    var disposable;

    beforeEach(function () {
      disposable = {
        dispose: sinon.spy()
      };

      app.register('unmountStore', Marty.createStore({
        getInitialState: function getInitialState() {
          return {};
        },
        addChangeListener: function addChangeListener() {
          return disposable;
        }
      }));

      mixin = Marty.createStateMixin({
        listenTo: 'unmountStore'
      });

      element = renderClassWithMixin(mixin);

      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    });

    it('should dispose of any listeners', function () {
      expect(disposable.dispose).to.have.been.called;
    });
  });

  describe('when the component props changes', function () {
    var child, parent, childRenderCount;

    beforeEach(function () {
      childRenderCount = 0;
      mixin = Marty.createStateMixin({
        getState: sinon.spy(function () {
          return {};
        })
      });

      child = React.createClass({
        displayName: 'child',

        mixin: [mixin],
        render: function render() {
          childRenderCount++;
          return React.createElement('div');
        }
      });

      parent = React.createClass({
        displayName: 'parent',

        render: function render() {
          return React.createElement(child, { user: this.state.user });
        },
        getInitialState: function getInitialState() {
          return {
            user: { name: 'foo' }
          };
        }
      });

      element = renderIntoDocument(React.createElement(parent));

      element.setState({
        user: { name: 'bar' }
      });
    });

    it('should update the components state', function () {
      expect(childRenderCount).to.equal(2);
    });
  });

  describe('when you pass in an object literal', function () {
    describe('#getState()', function () {
      describe('when not listening to anything', function () {
        var context;
        beforeEach(function () {
          mixin = Marty.createStateMixin({
            getState: function getState() {
              context = this;
              return initialState;
            }
          });
          element = renderClassWithMixin(mixin);
        });

        it('should call #getState() when calling #getInitialState()', function () {
          expect(element.state).to.eql(initialState);
        });

        it('should set the function context to the store', function () {
          expect(context).to.equal(element);
        });
      });
    });

    describe('#getInitialState()', function () {
      var state;
      beforeEach(function () {
        state = {
          foo: 'bar'
        };

        initialState = {
          bar: 'baz'
        };

        mixin = Marty.createStateMixin({
          getInitialState: function getInitialState() {
            return initialState;
          },
          getState: function getState() {
            return state;
          }
        });
      });
      it('should set state to merge of #getInitialState() and #getState()', function () {
        expect(mixin.getInitialState()).to.eql({
          foo: 'bar',
          bar: 'baz'
        });
      });
    });

    describe('#listenTo', function () {
      var newState = {
        meh: 'bar'
      };

      describe('single store', function () {
        beforeEach(function () {
          app.register('store1', createStore());
          mixin = Marty.createStateMixin({
            listenTo: 'store1',
            getState: function getState() {
              return this.app.store1.getState();
            }
          });
          element = renderClassWithMixin(mixin);
        });

        it('should called #getState() when the store has changed', function () {
          app.store1.setState(newState);
          expect(element.state).to.eql(newState);
        });
      });

      describe('multiple stores', function () {
        var store1State = { woo: 'bar' };
        var newState = { foo: 'bar' };

        beforeEach(function () {
          app.register('store1', createStore(store1State));
          app.register('store2', createStore());

          mixin = Marty.createStateMixin({
            listenTo: ['store1', 'store2'],
            getState: function getState() {
              return {
                store1: this.app.store1.getState(),
                store2: this.app.store2.getState()
              };
            }
          });
          element = renderClassWithMixin(mixin);
        });

        it('should called #getState() when any of the stores change', function () {
          app.store2.setState(newState);
          expect(element.state).to.eql({
            store1: store1State,
            store2: newState
          });
        });
      });
    });
  });

  function createStore(state) {
    return Marty.createStore({
      id: uuid.type('StateMixin'),
      getInitialState: function getInitialState() {
        return state || {};
      }
    });
  }

  function renderClassWithMixin(mixin, render) {
    var Component = React.createClass({
      mixins: [mixin],
      displayName: mixin.displayName,
      render: render || function () {
        state = this.state;
        componentFunctionContext = this;
        return React.createElement('div', null, this.state.name);
      }
    });

    return renderIntoDocument(React.createElement(Component, { app: app }));
  }
});
var _ = require('lodash');
var sinon = require('sinon');
var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var TestUtils = require('react/addons').addons.TestUtils;

describe('Application', () => {
  var Marty, application;

  beforeEach(() => {
    Marty = buildMarty();
  });

  describe('#dispatcher', () => {
    var dispatchHandler, payload;

    beforeEach(() => {
      payload = { foo: 'bar' };
      dispatchHandler = sinon.spy();
      application = new Marty.Application();
      application.dispatcher.register(dispatchHandler);
      application.dispatcher.dispatch(payload);
    });

    it('should have a dispatcher', () => {
      expect(dispatchHandler).to.be.calledWith(payload);
    });
  });

  describe('#register(key, value)', () => {
    var SomeStore;

    beforeEach(() => {
      class _SomeStore extends Marty.Store { }
      SomeStore = _SomeStore;

      application = new Marty.Application();
    });

    describe('when you pass in a string and a constructor', () => {
      beforeEach(() => {
        application.register('someStore', SomeStore);
        application.register('otherStore', SomeStore);
      });

      it('creates an instance of that type', () => {
        expect(application.someStore).to.be.instanceof(SomeStore);
      });

      it('passes the application through to the instance', () => {
        expect(application.someStore.app).to.equal(application);
      });

      it('allows you to get all instances with that type', () => {
        expect(application.getAllStores()).to.eql({
          someStore: application.someStore,
          otherStore: application.otherStore
        });
      });
    });

    describe('when you pass in an object literal where the values are constructors', () => {
      beforeEach(() => {
        application.register({
          someStore: SomeStore,
          otherStore: SomeStore
        });
      });

      it('creates instances of all those types', () => {
        expect(application.someStore).to.be.instanceof(SomeStore);
        expect(application.otherStore).to.be.instanceof(SomeStore);
      });

      it('passes the application through to the instance', () => {
        expect(application.someStore.app).to.equal(application);
        expect(application.otherStore.app).to.equal(application);
      });

      it('allows you to get all instances with that type', () => {
        expect(application.getAllStores()).to.eql({
          someStore: application.someStore,
          otherStore: application.otherStore
        });
      });
    });

    describe('when you pass in an object literal where the values are also object literals', () => {
      beforeEach(() => {
        application.register({
          some: {
            cool: {
              store: SomeStore
            }
          },
          other: {
            store: SomeStore
          }
        });
      });

      it('creates instances of all those types', () => {
        expect(application.some.cool.store).to.be.instanceof(SomeStore);
        expect(application.other.store).to.be.instanceof(SomeStore);
      });

      it('passes the application through to the instance', () => {
        expect(application.some.cool.store.app).to.equal(application);
        expect(application.other.store.app).to.equal(application);
      });

      it('allows you to get all instances with that type', () => {
        expect(application.getAllStores()).to.eql({
          'some.cool.store': application.some.cool.store,
          'other.store': application.other.store
        });
      });
    });
  });

  describe('#bindTo(InnerComponent)', () => {
    beforeEach(() => {
      application = new Marty.Application();
    });

    describe('when you dont pass in a component', () => {
      it('should throw an error', () => {
        expect(bindToNull).to.throw(Error);

        function bindToNull() {
          application.bindTo();
        }
      });
    });

    describe('when you pass in a react component', () => {
      var actualApplication, actualProps, expectedProps;

      beforeEach(() => {
        application = new Marty.Application();
        var InnerComponent = React.createClass({
          contextTypes: Marty.contextTypes,
          render() {
            actualProps = this.props;
            actualApplication = this.context.app;

            return <div/>;
          }
        });

        expectedProps = { foo: 'bar' };
        var ContainerComponent = application.bindTo(InnerComponent);

        TestUtils.renderIntoDocument(<ContainerComponent {...expectedProps} />);
      });

      it('should pass the props through to the inner component', () => {
        expect(actualProps).to.eql(expectedProps);
      });

      it('should pass the application down through the context', () => {
        expect(actualApplication).to.equal(application);
      });
    });
  });

  describe('#fetch(callback)', function () {
    describe('when stores make requests to fetch data', function () {
      var Store1, Store2, fetches, diagnostics, timeout;

      beforeEach(function () {
        timeout = 50;
        fetches = {
          foo: {
            expectedTime: 10,
            expectedState: { foo: 'bar' }
          },
          bar: {
            expectedTime: 30,
            expectedError: new Error()
          },
          baz: { }
        };

        Store1 = Marty.createStore({
          id: 'Store1',
          foo: fetchFunc('foo'),
          bar: fetchFunc('bar')
        });

        Store2 = Marty.createStore({
          id: 'Store2',
          baz: fetchFunc('baz')
        });

        class Application extends Marty.Application {
          constructor() {
            super();

            this.register('store1', Store1);
            this.register('store2', Store2);
          }
        }

        var app = new Application();
        var fetchState = () => {
          app.store1.foo();
          app.store1.bar();
          app.store2.baz();
        };

        return app
          .fetch(fetchState, { timeout: timeout })
          .then(res => diagnostics = res);
      });

      it('should return diagnostics about the fetches', function () {
        // Cannot reliably test time so just going to ignore
        var diagnosticsWithoutTime = _.map(diagnostics, function (diagnostic) {
          return _.omit(diagnostic, 'time');
        });

        expect(diagnosticsWithoutTime).to.eql([{
          fetchId: 'foo',
          storeId: 'Store1',
          status: 'DONE',
          result: fetches.foo.expectedState
        }, {
          fetchId: 'bar',
          storeId: 'Store1',
          status: 'FAILED',
          error: fetches.bar.expectedError
        }, {
          fetchId: 'baz',
          storeId: 'Store2',
          status: 'PENDING'
        }]);
      });

      function fetchFunc(id) {
        return function () {
          var options = fetches[id];

          return this.fetch({
            id: id,
            locally: function () {
              return options.localState;
            },
            remotely: function () {
              return new Promise(function (resolve, reject) {
                if (options.expectedState) {
                  options.localState = options.expectedState;

                  setTimeout(resolve, options.expectedTime);
                } else if (options.expectedError) {
                  setTimeout(() => reject(options.expectedError), options.expectedTime);
                }
              });
            }
          });
        };
      }
    });
  });
});
var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

describe('Application', () => {
  var Marty, application;

  beforeEach(() => {
    Marty = buildMarty();
  });

  describe('when you pass in a req/res into the application', () => {
    beforeEach(() => {
      application = new Marty.Application({
        req: 'foo',
        res: 'bar'
      });
    });

    it('should add those options to the application', () => {
      expect(application.req).to.equal('foo');
      expect(application.res).to.equal('bar');
    });
  });

  describe('when you pass in some `register` options', () => {
    var register, registrations;

    beforeEach(() => {
      register = sinon.spy(Marty.Application.prototype, 'register');

      registrations = {
        userStore: Marty.Store
      };

      application = new Marty.Application({
        register: registrations
      });
    });

    afterEach(() => {
      register.restore();
    });

    it('should automatically pass it to the #register()', () => {
      expect(register).to.be.calledWith(registrations);
    });
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
        var diagnosticsWithoutTime = _.map(diagnostics.toJSON(), function (diagnostic) {
          return _.omit(diagnostic, 'time');
        });

        expect(diagnosticsWithoutTime).to.eql([{
          fetchId: 'foo',
          storeId: 'store1',
          status: 'DONE',
          result: fetches.foo.expectedState
        }, {
          fetchId: 'bar',
          storeId: 'store1',
          status: 'FAILED',
          error: fetches.bar.expectedError
        }, {
          fetchId: 'baz',
          storeId: 'store2',
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
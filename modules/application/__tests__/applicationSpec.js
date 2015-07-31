'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');

describe('Application', function () {
  var Marty, application;

  beforeEach(function () {
    Marty = buildMarty();
  });

  describe('when you pass in a req/res into the application', function () {
    beforeEach(function () {
      application = new Marty.Application({
        req: 'foo',
        res: 'bar'
      });
    });

    it('should add those options to the application', function () {
      expect(application.req).to.equal('foo');
      expect(application.res).to.equal('bar');
    });
  });

  describe('when you pass in some `register` options', function () {
    var register, registrations;

    beforeEach(function () {
      register = sinon.spy(Marty.Application.prototype, 'register');

      registrations = {
        userStore: Marty.Store
      };

      application = new Marty.Application({
        register: registrations
      });
    });

    afterEach(function () {
      register.restore();
    });

    it('should automatically pass it to the #register()', function () {
      expect(register).to.be.calledWith(registrations);
    });
  });

  describe('#dispatcher', function () {
    var dispatchHandler, payload;

    beforeEach(function () {
      payload = { foo: 'bar' };
      dispatchHandler = sinon.spy();
      application = new Marty.Application();
      application.dispatcher.register(dispatchHandler);
      application.dispatcher.dispatch(payload);
    });

    it('should have a dispatcher', function () {
      expect(dispatchHandler).to.be.calledWith(payload);
    });
  });

  describe('#register(key, value)', function () {
    var SomeStore;

    beforeEach(function () {
      var _SomeStore = (function (_Marty$Store) {
        _inherits(_SomeStore, _Marty$Store);

        function _SomeStore() {
          _classCallCheck(this, _SomeStore);

          _get(Object.getPrototypeOf(_SomeStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return _SomeStore;
      })(Marty.Store);

      SomeStore = _SomeStore;

      application = new Marty.Application();
    });

    describe('when you pass in a string and a constructor', function () {
      beforeEach(function () {
        application.register('someStore', SomeStore);
        application.register('otherStore', SomeStore);
      });

      it('creates an instance of that type', function () {
        expect(application.someStore).to.be['instanceof'](SomeStore);
      });

      it('passes the application through to the instance', function () {
        expect(application.someStore.app).to.equal(application);
      });

      it('allows you to get all instances with that type', function () {
        expect(application.getAllStores()).to.eql({
          someStore: application.someStore,
          otherStore: application.otherStore
        });
      });
    });

    describe('when you pass in an object literal where the values are constructors', function () {
      beforeEach(function () {
        application.register({
          someStore: SomeStore,
          otherStore: SomeStore
        });
      });

      it('creates instances of all those types', function () {
        expect(application.someStore).to.be['instanceof'](SomeStore);
        expect(application.otherStore).to.be['instanceof'](SomeStore);
      });

      it('passes the application through to the instance', function () {
        expect(application.someStore.app).to.equal(application);
        expect(application.otherStore.app).to.equal(application);
      });

      it('allows you to get all instances with that type', function () {
        expect(application.getAllStores()).to.eql({
          someStore: application.someStore,
          otherStore: application.otherStore
        });
      });
    });

    describe('when you pass in an object literal where the values are also object literals', function () {
      beforeEach(function () {
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

      it('creates instances of all those types', function () {
        expect(application.some.cool.store).to.be['instanceof'](SomeStore);
        expect(application.other.store).to.be['instanceof'](SomeStore);
      });

      it('passes the application through to the instance', function () {
        expect(application.some.cool.store.app).to.equal(application);
        expect(application.other.store.app).to.equal(application);
      });

      it('allows you to get all instances with that type', function () {
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
          baz: {}
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

        var Application = (function (_Marty$Application) {
          _inherits(Application, _Marty$Application);

          function Application() {
            _classCallCheck(this, Application);

            _get(Object.getPrototypeOf(Application.prototype), 'constructor', this).call(this);

            this.register('store1', Store1);
            this.register('store2', Store2);
          }

          return Application;
        })(Marty.Application);

        var app = new Application();
        var fetchState = function fetchState() {
          app.store1.foo();
          app.store1.bar();
          app.store2.baz();
        };

        return app.fetch(fetchState, { timeout: timeout }).then(function (res) {
          return diagnostics = res;
        });
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
            locally: function locally() {
              return options.localState;
            },
            remotely: function remotely() {
              return new Promise(function (resolve, reject) {
                if (options.expectedState) {
                  options.localState = options.expectedState;

                  setTimeout(resolve, options.expectedTime);
                } else if (options.expectedError) {
                  setTimeout(function () {
                    return reject(options.expectedError);
                  }, options.expectedTime);
                }
              });
            }
          });
        };
      }
    });
  });
});
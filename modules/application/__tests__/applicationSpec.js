'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ = require('lodash');
var sinon = require('sinon');
var React = require('react');
var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var TestUtils = require('react/addons').addons.TestUtils;

describe('Application', function () {
  var Marty, application;

  beforeEach(function () {
    Marty = buildMarty();
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
        function _SomeStore() {
          _classCallCheck(this, _SomeStore);

          if (_Marty$Store != null) {
            _Marty$Store.apply(this, arguments);
          }
        }

        _inherits(_SomeStore, _Marty$Store);

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

  describe('#bindTo(InnerComponent)', function () {
    beforeEach(function () {
      application = new Marty.Application();
    });

    describe('when you dont pass in a component', function () {
      it('should throw an error', function () {
        expect(bindToNull).to['throw'](Error);

        function bindToNull() {
          application.bindTo();
        }
      });
    });

    describe('when you pass in a react component', function () {
      var actualApplication, actualProps, expectedProps;

      beforeEach(function () {
        application = new Marty.Application();
        var InnerComponent = React.createClass({
          displayName: 'InnerComponent',

          contextTypes: Marty.contextTypes,
          render: function render() {
            actualProps = this.props;
            actualApplication = this.context.app;

            return React.createElement('div', null);
          }
        });

        expectedProps = { foo: 'bar' };
        var ContainerComponent = application.bindTo(InnerComponent);

        TestUtils.renderIntoDocument(React.createElement(ContainerComponent, expectedProps));
      });

      it('should pass the props through to the inner component', function () {
        expect(actualProps).to.eql(expectedProps);
      });

      it('should pass the application down through the context', function () {
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
          baz: {}
        };

        Marty.isASingleton = false;

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
          function Application() {
            _classCallCheck(this, Application);

            _get(Object.getPrototypeOf(Application.prototype), 'constructor', this).call(this);

            this.register('store1', Store1);
            this.register('store2', Store2);
          }

          _inherits(Application, _Marty$Application);

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
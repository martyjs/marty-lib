'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ = require('lodash');
var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('Marty#dehydrate()', function (styles) {
  var Marty, store1ExpectedState, storeSerializedState, serializedState, expectedFetchId;

  beforeEach(function () {
    Marty = buildMarty();
    Marty.isASingleton = true;
    expectedFetchId = 'FETCH';
    storeSerializedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };
    styles({
      classic: function classic() {
        Marty.createStore({
          id: 'Store1',
          getInitialState: _.noop,
          dehydrate: function dehydrate() {
            return store1ExpectedState;
          },
          testFetch: function testFetch() {
            this.fetch({
              id: expectedFetchId,
              locally: function locally() {
                return { foo: 'bar' };
              }
            });
          }
        }).testFetch();

        Marty.createStore({
          id: 'Store2',
          getInitialState: _.noop,
          dehydrate: function dehydrate() {
            return storeSerializedState;
          }
        });

        Marty.createStore({
          id: 'Store3',
          getInitialState: _.noop,
          testFetch: function testFetch() {
            this.fetch({
              id: expectedFetchId,
              locally: function locally() {
                return { foo: 'bar' };
              }
            });
          }
        }).testFetch();
      },
      es6: function es6() {
        var Store1 = (function (_Marty$Store) {
          function Store1() {
            _classCallCheck(this, Store1);

            if (_Marty$Store != null) {
              _Marty$Store.apply(this, arguments);
            }
          }

          _inherits(Store1, _Marty$Store);

          _createClass(Store1, [{
            key: 'dehydrate',
            value: function dehydrate() {
              return store1ExpectedState;
            }
          }, {
            key: 'testFetch',
            value: function testFetch() {
              this.fetch({
                id: expectedFetchId,
                locally: function locally() {
                  return { foo: 'bar' };
                }
              });
            }
          }]);

          return Store1;
        })(Marty.Store);

        var Store2 = (function (_Marty$Store2) {
          function Store2() {
            _classCallCheck(this, Store2);

            if (_Marty$Store2 != null) {
              _Marty$Store2.apply(this, arguments);
            }
          }

          _inherits(Store2, _Marty$Store2);

          _createClass(Store2, [{
            key: 'dehydrate',
            value: function dehydrate() {
              return storeSerializedState;
            }
          }]);

          return Store2;
        })(Marty.Store);

        var Store3 = (function (_Marty$Store3) {
          function Store3() {
            _classCallCheck(this, Store3);

            if (_Marty$Store3 != null) {
              _Marty$Store3.apply(this, arguments);
            }
          }

          _inherits(Store3, _Marty$Store3);

          _createClass(Store3, [{
            key: 'testFetch',
            value: function testFetch() {
              this.fetch({
                id: expectedFetchId,
                locally: function locally() {
                  return { foo: 'bar' };
                }
              });
            }
          }]);

          return Store3;
        })(Marty.Store);

        Marty.register(Store1).testFetch();
        Marty.register(Store2);
        Marty.register(Store3).testFetch();
      }
    });

    serializedState = Marty.dehydrate();
  });

  it('should serialze all the stores', function () {
    expect(serializedState.toJSON()).to.eql({
      Store1: {
        fetchHistory: _defineProperty({}, expectedFetchId, true),
        state: store1ExpectedState
      },
      Store2: {
        fetchHistory: {},
        state: storeSerializedState
      },
      Store3: {
        fetchHistory: _defineProperty({}, expectedFetchId, true),
        state: {}
      }
    });
  });

  describe('#toString()', function () {
    it('should create a string that can be injected into the page', function () {
      expect(serializedState.toString()).to.equal('(window.__marty||(window.__marty={})).stores=' + JSON.stringify({
        Store1: {
          fetchHistory: _defineProperty({}, expectedFetchId, true),
          state: store1ExpectedState
        },
        Store2: {
          fetchHistory: {},
          state: storeSerializedState
        },
        Store3: {
          fetchHistory: _defineProperty({}, expectedFetchId, true),
          state: {}
        }
      }));
    });
  });
});
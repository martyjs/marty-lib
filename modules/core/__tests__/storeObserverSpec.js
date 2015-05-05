'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var StoreObserver = require('../storeObserver');
var buildMarty = require('../../../test/lib/buildMarty');

describe('StoreObserver', function () {
  var Marty;

  beforeEach(function () {
    Marty = buildMarty();
  });

  describe('when `stores` contains strings', function () {
    describe('when you dont pass in an application', function () {
      it('should throw an error', function () {
        expect(notPassingInAnApplication).to['throw'](Error);

        function notPassingInAnApplication() {
          return new StoreObserver({
            stores: ['foo']
          });
        }
      });
    });

    describe('when you have an id that isn\'t in the application', function () {
      it('should throw an error', function () {
        expect(listeningToAStoreThatDoesntExist).to['throw'](Error);

        function listeningToAStoreThatDoesntExist() {
          return new StoreObserver({
            stores: ['foo'],
            app: new Marty.Application()
          });
        }
      });
    });

    describe('when you have an id that is registered to the application', function () {
      var onStoreChanged;

      beforeEach(function () {
        onStoreChanged = sinon.spy();

        var app = new Marty.Application();

        app.register('foo', Marty.Store);

        new StoreObserver({ // jshint ignore:line
          app: app,
          component: {},
          stores: ['foo'],
          onStoreChanged: onStoreChanged
        });

        app.foo.hasChanged();
      });

      it('should listen to that store', function () {
        expect(onStoreChanged).to.be.calledOnce;
      });
    });
  });
});
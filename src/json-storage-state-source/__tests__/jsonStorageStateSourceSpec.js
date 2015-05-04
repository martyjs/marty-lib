var expect = require('chai').expect;
var warnings = require('../../core/warnings');
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('JSONStorageStateSource', function (styles) {
  var source, payload, serializedPayload, Marty;

  payload = {
    value: {
      bar: 'bar'
    }
  };
  serializedPayload = JSON.stringify(payload);

  beforeEach(function () {
    Marty = buildMarty();

    localStorage.clear();
    sessionStorage.clear();
    var Source = styles({
      classic: function () {
        return Marty.createStateSource({
          type: 'jsonStorage'
        });
      },
      es6: function () {
        return class StateSource extends Marty.JSONStorageStateSource {
        };
      }
    });

    source = new Source();
  });

  afterEach(function () {
    warnings.classDoesNotHaveAnId = true;
  });

  describe('#createRepository()', function () {
    it('should expose get and set methods', function () {
      expect(source).to.have.property('get');
      expect(source).to.have.property('set');
    });
  });

  describe('#set()', function () {
    beforeEach(function () {
      source.set('foo', payload.value);
    });

    it('should store serialized data under key in localStorage', function () {
      var raw = localStorage.getItem('foo');
      expect(raw).to.equal(serializedPayload);
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      localStorage.setItem('foo', serializedPayload);
    });

    it('should retrieve serialized data under key in localStorage', function () {
      expect(source.get('foo')).to.deep.equal(payload.value);
    });

    describe('when the value is undefined', function () {
      var result;

      beforeEach(function () {
        result = source.get('bar');
      });

      it('should return null', function () {
        expect(result).to.equal(null);
      });
    });
  });

  describe('#storage', function () {
    describe('when you pass in a custom web storage object', function () {
      beforeEach(function () {
        var Source = styles({
          classic: function () {
            return Marty.createStateSource({
              type: 'jsonStorage',
              storage: sessionStorage
            });
          },
          es6: function () {
            return class StateSource extends Marty.JSONStorageStateSource {
              get storage() {
                return sessionStorage;
              }
            };
          }
        });

        source = new Source();

        source.set('foo', payload.value);
      });
      it('should use the custom web storage object', function () {
        expect(sessionStorage.getItem('foo')).to.equal(serializedPayload);
      });
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      var Source = Marty.createStateSource({
        namespace: 'baz',
        type: 'jsonStorage'
      });

      source = new Source();
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          localStorage.setItem('bazfoo', serializedPayload);
        });

        it('should prepend namespace to key', function () {
          expect(source.get('foo')).to.deep.equal(payload.value);
        });
      });

      describe('when storing data', function () {
        beforeEach(function () {
          source.set('foo', payload.value);
        });

        it('should prepend namespace to key', function () {
          expect(localStorage.getItem('bazfoo')).to.equal(serializedPayload);
        });
      });
    });
  });
});
var expect = require('chai').expect;
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

describeStyles('CookieStateSource', (styles) => {
  var source, cookies, Marty;

  beforeEach(() => {
    Marty = buildMarty();
    cookies = require('cookies-js');
    var CookieSource = styles({
      classic: () => {
        return Marty.createStateSource({
          type: 'cookie'
        });
      },
      es6: () => {
        return class Cookies extends Marty.CookieStateSource { };
      }
    });

    source = new CookieSource();
  });

  describe('#set()', () => {
    beforeEach(() => {
      source.set('foo', 'bar');
    });

    it('should set the key in the cookie', () => {
      expect(cookies.get('foo')).to.equal('bar');
    });
  });

  describe('when you pass in a non string', () => {
    it('should throw an error', () => {
      expect(settingNonString).to.throw(Error);

      function settingNonString() {
        source.set(123, 'bar');
      }
    });
  });

  describe('#get()', () => {
    beforeEach(() => {
      cookies.set('foo', 'bar');
    });

    it('should retrieve data under key in cookie', () => {
      expect(source.get('foo')).to.equal('bar');
    });
  });

  describe('#expire()', () => {
    beforeEach(() => {
      cookies.set('foo', 'bar');

      source.expire('foo');
    });

    it('should retrieve data under key in cookie', () => {
      expect(source.get('foo')).to.not.exist;
    });
  });
});
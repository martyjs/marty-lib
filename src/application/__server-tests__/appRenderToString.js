var React = require('react');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var uuid = require('../../core/utils/uuid');
var buildMarty = require('../../../test/lib/buildMarty');
var es6MessagesFixtures = require('./fixtures/es6Messages');
var describeStyles = require('../../../test/lib/describeStyles');
var classicMessagesFixtures = require('./fixtures/classicMessages');

var MARTY_STATE_ID = '__marty-state';

describeStyles('Application#renderToString', function (styles) {
  var $, app, Marty, fixture, expectedId;

  beforeEach(function () {
    Marty = buildMarty();
    expectedId = uuid.small();
    fixture = styles({
      classic: function () {
        return classicMessagesFixtures(Marty);
      },
      es6: function () {
        return es6MessagesFixtures(Marty);
      }
    });

    app = new fixture.App();
    fixture.Message = app.bindTo(fixture.Message);
    app.messageStore.setContextName('local-context');
  });

  describe('when you dont pass in a component type', function () {
    it('should reject', function () {
      return expect(app.renderToString({ })).to.be.rejected;
    });
  });

  describe('when all the state is present locally', function () {
    beforeEach(function () {
      app.messageStore.addMessage(expectedId, { text: 'local' });
      return renderToString();
    });

    it('should get the state', function () {
      expect($('.text').text()).to.equal('local');
    });

    it('should come from the correct context', function () {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', function () {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(app.dehydrate(context).toString());
    });
  });

  describe('when it needs to wait for state to come from a remote source', function () {
    beforeEach(function () {
      return renderToString();
    });

    it('should get the state', function () {
      expect($('.text').text()).to.equal('remote');
    });

    it('should come from the correct context', function () {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', function () {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(app.dehydrate(context).toString());
    });
  });

  describe('timeout', function () {
    beforeEach(function () {
      app.messageAPI.delay = 1500;

      return renderToString({
        timeout: 100
      });
    });

    it('should render after the timeout regardless of whether fetches are complete', function () {
      expect($('.text').text()).to.equal('pending');
    });
  });

  function renderToString(options) {
    return app
      .renderToString(<fixture.Message id={expectedId} />, options)
      .then(loadDOM);
  }

  function loadDOM(result) {
    $ = cheerio.load(result.html);
  }
});
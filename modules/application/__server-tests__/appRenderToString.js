'use strict';

var React = require('react');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var uuid = require('../../core/utils/uuid');
var buildMarty = require('../../../test/lib/buildMarty');
var es6MessagesFixtures = require('./fixtures/es6Messages');
var describeStyles = require('../../../test/lib/describeStyles');
var childComponentsFixtures = require('./fixtures/childComponents');
var classicMessagesFixtures = require('./fixtures/classicMessages');

var MARTY_STATE_ID = '__marty-state';

describeStyles('Application#renderToString', function (styles) {
  var $, app, Marty, fixture, expectedId;

  beforeEach(function () {
    Marty = buildMarty();
    expectedId = uuid.small();
    fixture = styles({
      classic: function classic() {
        return classicMessagesFixtures(Marty);
      },
      es6: function es6() {
        return es6MessagesFixtures(Marty);
      }
    });

    app = new fixture.App();
    app.messageStore.setContextName('local-context');
  });

  describe('when you dont pass in a component type', function () {
    it('should reject', function () {
      return expect(app.renderToString({})).to.be.rejected;
    });
  });

  describe('when you want to render the individual parts', function () {
    var body = undefined,
        state = undefined;

    beforeEach(function () {
      app.messageStore.addMessage(expectedId, { text: 'local' });

      return app.renderToStaticMarkup(React.createElement(fixture.Message, { id: expectedId })).then(function (res) {
        body = cheerio.load(res.htmlBody);
        state = cheerio.load(res.htmlState);
      });
    });

    it('should get the state', function () {
      expect(body('.text').text()).to.equal('local');
    });

    it('should include the serialized state', function () {
      expect(state('#' + MARTY_STATE_ID).attr('data-state')).to.equal(JSON.stringify(app.dehydrate()));
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
      expect($('#' + MARTY_STATE_ID).attr('data-state')).to.equal(JSON.stringify(app.dehydrate(context)));
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
      expect($('#' + MARTY_STATE_ID).attr('data-state')).to.equal(JSON.stringify(app.dehydrate(context)));
    });
  });

  describe('#renderToStaticMarkup()', function () {
    beforeEach(function () {
      return renderToStaticMarkup();
    });

    it('should get the state', function () {
      expect($('.text').text()).to.equal('remote');
    });

    it('should come from the correct context', function () {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', function () {
      expect($('#' + MARTY_STATE_ID).attr('data-state')).to.equal(JSON.stringify(app.dehydrate(context)));
    });
  });

  describe('when there are child components', function () {
    beforeEach(function () {
      var _childComponentsFixtures = childComponentsFixtures(Marty);

      var Application = _childComponentsFixtures.Application;
      var Component = _childComponentsFixtures.Component;

      var app = new Application();

      return app.renderToString(React.createElement(Component, null)).then(loadDOM);
    });

    it('should render both the parent and child component', function () {
      expect($('#child').text()).to.eql('Child');
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

  describe('sanitizing HTML in state', function () {
    beforeEach(function () {
      app.messageStore.addMessage(expectedId, { text: 'local</script>' });

      return app.renderToStaticMarkup(React.createElement(fixture.Message, { id: expectedId })).then(loadDOM);
    });

    it('should include the correct state', function () {
      expect($('#' + MARTY_STATE_ID).attr('data-state')).to.equal(JSON.stringify(app.dehydrate(context)));
    });
  });

  function renderToString(options) {
    return app.renderToString(React.createElement(fixture.Message, { id: expectedId }), options).then(loadDOM);
  }

  function renderToStaticMarkup(options) {
    return app.renderToStaticMarkup(React.createElement(fixture.Message, { id: expectedId }), options).then(loadDOM);
  }

  function loadDOM(result) {
    $ = cheerio.load(result.html);
  }
});
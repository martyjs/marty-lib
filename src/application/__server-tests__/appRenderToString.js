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

  beforeEach(() => {
    Marty = buildMarty();
    expectedId = uuid.small();
    fixture = styles({
      classic() {
        return classicMessagesFixtures(Marty);
      },
      es6() {
        return es6MessagesFixtures(Marty);
      }
    });

    app = new fixture.App();
    app.messageStore.setContextName('local-context');
  });

  describe('when you dont pass in a component type', () => {
    it('should reject', () => {
      return expect(app.renderToString({ })).to.be.rejected;
    });
  });

  describe('when you want to render the individual parts', () => {
    let body, state;

    beforeEach(() => {
      app.messageStore.addMessage(expectedId, { text: 'local' });

      return app
        .renderToStaticMarkup(<fixture.Message id={expectedId} />)
        .then(res => {
          body = cheerio.load(res.htmlBody);
          state = cheerio.load(res.htmlState);
        });
    });

    it('should get the state', () => {
      expect(body('.text').text()).to.equal('local');
    });

    it('should include the serialized state', () => {
      expect(state(`#${MARTY_STATE_ID}`).html()).to.equal(app.dehydrate().toString());
    });
  });

  describe('when all the state is present locally', () => {
    beforeEach(() => {
      app.messageStore.addMessage(expectedId, { text: 'local' });
      return renderToString();
    });

    it('should get the state', () => {
      expect($('.text').text()).to.equal('local');
    });

    it('should come from the correct context', () => {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', () => {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(app.dehydrate(context).toString());
    });
  });

  describe('when it needs to wait for state to come from a remote source', () => {
    beforeEach(() => {
      return renderToString();
    });

    it('should get the state', () => {
      expect($('.text').text()).to.equal('remote');
    });

    it('should come from the correct context', () => {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', () => {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(app.dehydrate(context).toString());
    });
  });

  describe('#renderToStaticMarkup()', () => {
    beforeEach(() => {
      return renderToStaticMarkup();
    });

    it('should get the state', () => {
      expect($('.text').text()).to.equal('remote');
    });

    it('should come from the correct context', () => {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', () => {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(app.dehydrate(context).toString());
    });
  });

  describe('when there are child components', () => {
    beforeEach(() => {
      var { Application, Component } = childComponentsFixtures(Marty);

      var app = new Application();

      return app.renderToString(<Component/>).then(loadDOM);
    });

    it('should render both the parent and child component', function () {
      expect($('#child').text()).to.eql('Child');
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      app.messageAPI.delay = 1500;

      return renderToString({
        timeout: 100
      });
    });

    it('should render after the timeout regardless of whether fetches are complete', () => {
      expect($('.text').text()).to.equal('pending');
    });
  });

  function renderToString(options) {
    return app
      .renderToString(<fixture.Message id={expectedId} />, options)
      .then(loadDOM);
  }

  function renderToStaticMarkup(options) {
    return app
      .renderToStaticMarkup(<fixture.Message id={expectedId} />, options)
      .then(loadDOM);
  }

  function loadDOM(result) {
    $ = cheerio.load(result.html);
  }
});
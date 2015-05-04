'use strict';

var React = require('react');
var _ = require('../../../mindash');

module.exports = function (Marty) {
  var MessageStore = Marty.createStore({
    getInitialState: function getInitialState() {
      return {};
    },
    setContextName: function setContextName(name) {
      this.state.contextName = name;
    },
    addMessage: function addMessage(id, message) {
      this.state[id] = _.extend(message, {
        id: id,
        context: this.state.contextName
      });
    },
    getMessage: function getMessage(id) {
      return this.fetch({
        id: id,
        locally: function locally() {
          return this.state[id];
        },
        remotely: function remotely() {
          return this.app.messageAPI.getMessage(id);
        }
      });
    }
  });

  var MessageAPI = Marty.createStateSource({
    delay: 10,
    getMessage: function getMessage(id) {
      return new Promise((function (resolve) {
        setTimeout((function () {
          this.app.messageStore.addMessage(id, { text: 'remote' });
          resolve();
        }).bind(this), this.delay);
      }).bind(this));
    }
  });

  var MessageState = Marty.createStateMixin({
    listenTo: 'messageStore',
    getState: function getState() {
      return {
        message: this.app.messageStore.getMessage(this.props.id)
      };
    }
  });

  var Message = React.createClass({
    displayName: 'Message',

    mixins: [MessageState],
    render: function render() {
      var message = this.state.message.when({
        pending: function pending() {
          return {
            text: 'pending'
          };
        },
        failed: function failed(error) {
          return {
            text: 'error: ' + error
          };
        },
        done: function done(message) {
          return message;
        }
      });

      return React.createElement('div', { id: 'message' }, React.createElement('div', { className: 'text' }, message.text), React.createElement('div', { className: 'context' }, message.context));
    }
  });

  var App = Marty.createApplication(function () {
    this.register({
      messageAPI: MessageAPI,
      messageStore: MessageStore
    });
  });

  return {
    App: App,
    Message: Message
  };
};
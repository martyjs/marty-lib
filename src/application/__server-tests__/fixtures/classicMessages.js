var React = require('react');
var _ = require('../../../mindash');

module.exports = function (Marty) {
  var MessageStore = Marty.createStore({
    getInitialState: function () {
      return {};
    },
    setContextName: function (name) {
      this.state.contextName = name;
    },
    addMessage: function (id, message) {
      this.state[id] = _.extend(message, {
        id: id,
        context: this.state.contextName
      });
    },
    getMessage: function (id) {
      return this.fetch({
        id: id,
        locally: function () {
          return this.state[id];
        },
        remotely: function () {
          return this.app.messageAPI.getMessage(id);
        }
      });
    }
  });

  var MessageAPI = Marty.createStateSource({
    delay: 10,
    getMessage: function (id) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          this.app.messageStore.addMessage(id, { text: 'remote' });
          resolve();
        }.bind(this), this.delay);
      }.bind(this));
    }
  });

  var MessageState = Marty.createStateMixin({
    listenTo: 'messageStore',
    getState: function () {
      return {
        message: this.app.messageStore.getMessage(this.props.id)
      };
    }
  });

  var Message = React.createClass({
    mixins: [MessageState],
    render: function () {
      var message = this.state.message.when({
        pending: function () {
          return {
            text: 'pending'
          };
        },
        failed: function (error) {
          return {
            text: 'error: ' + error
          };
        },
        done: function (message) {
          return message;
        }
      });

      return React.createElement('div', { id: 'message' },
        React.createElement('div', { className: 'text' }, message.text),
        React.createElement('div', { className: 'context' }, message.context)
      );
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
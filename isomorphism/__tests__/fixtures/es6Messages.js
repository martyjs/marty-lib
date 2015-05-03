var React = require('react');
var _ = require('../../mindash');

module.exports = function (Marty) {
  var messageStore, messageAPI, message;

  class MessageStore extends Marty.Store {
    constructor(options) {
      super(options);
      this.state = {};
    }

    setContextName(name) {
      this.state.contextName = name;
    }
    addMessage(id, message) {
      this.state[id] = _.extend(message, {
        id: id,
        context: this.state.contextName
      });
    }
    getMessage(id) {
      return this.fetch({
        id: id,
        locally() {
          return this.state[id];
        },
        remotely() {
          return messageAPI.for(this).getMessage(id);
        }
      });
    }
  }

  class MessageAPI extends Marty.StateSource {
    constructor(options) {
      super(options);
      this.delay = 10;
    }
    getMessage(id) {
      return new Promise((resolve) => {
        setTimeout(() => {
          messageStore.for(this).addMessage(id, { text: 'remote' });
          resolve();
        }, this.delay);
      });
    }
  }

  class Message extends React.Component {
    render() {
      var message = this.props.message;

      return React.createElement('div', { id: 'message' },
        React.createElement('div', { className: 'text' }, message.text),
        React.createElement('div', { className: 'context' }, message.context)
      );
    }
  }

  messageAPI = Marty.register(MessageAPI);
  messageStore = Marty.register(MessageStore);
  message = Marty.createContainer(Message, {
    listenTo: messageStore,
    fetch: {
      message() {
        return messageStore.for(this).getMessage(this.props.id)
      }
    },
    pending() {
      return this.done({
        message: {
          text: 'pending'
        }
      })
    },
    failed(errors) {
      return this.done({
        message: {
          text: 'error: ' + errors.message
        }
      });
    }
  });

  return {
    Message: message,
    MessageAPI: messageAPI,
    MessageStore: messageStore
  };
};
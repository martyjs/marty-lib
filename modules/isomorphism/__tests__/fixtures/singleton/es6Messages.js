'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var React = require('react');
var _ = require('../../../../mindash');

module.exports = function (Marty) {
  var messageStore, messageAPI, message;

  var MessageStore = (function (_Marty$Store) {
    function MessageStore(options) {
      _classCallCheck(this, MessageStore);

      _get(Object.getPrototypeOf(MessageStore.prototype), 'constructor', this).call(this, options);
      this.state = {};
    }

    _inherits(MessageStore, _Marty$Store);

    _createClass(MessageStore, [{
      key: 'setContextName',
      value: function setContextName(name) {
        this.state.contextName = name;
      }
    }, {
      key: 'addMessage',
      value: function addMessage(id, message) {
        this.state[id] = _.extend(message, {
          id: id,
          context: this.state.contextName
        });
      }
    }, {
      key: 'getMessage',
      value: function getMessage(id) {
        return this.fetch({
          id: id,
          locally: function locally() {
            return this.state[id];
          },
          remotely: function remotely() {
            return messageAPI['for'](this).getMessage(id);
          }
        });
      }
    }]);

    return MessageStore;
  })(Marty.Store);

  var MessageAPI = (function (_Marty$StateSource) {
    function MessageAPI(options) {
      _classCallCheck(this, MessageAPI);

      _get(Object.getPrototypeOf(MessageAPI.prototype), 'constructor', this).call(this, options);
      this.delay = 10;
    }

    _inherits(MessageAPI, _Marty$StateSource);

    _createClass(MessageAPI, [{
      key: 'getMessage',
      value: function getMessage(id) {
        var _this7 = this;

        return new Promise(function (resolve) {
          setTimeout(function () {
            messageStore['for'](_this7).addMessage(id, { text: 'remote' });
            resolve();
          }, _this7.delay);
        });
      }
    }]);

    return MessageAPI;
  })(Marty.StateSource);

  var Message = (function (_React$Component) {
    function Message() {
      _classCallCheck(this, Message);

      if (_React$Component != null) {
        _React$Component.apply(this, arguments);
      }
    }

    _inherits(Message, _React$Component);

    _createClass(Message, [{
      key: 'render',
      value: function render() {
        var message = this.props.message;

        return React.createElement('div', { id: 'message' }, React.createElement('div', { className: 'text' }, message.text), React.createElement('div', { className: 'context' }, message.context));
      }
    }]);

    return Message;
  })(React.Component);

  messageAPI = Marty.register(MessageAPI);
  messageStore = Marty.register(MessageStore);
  message = Marty.createContainer(Message, {
    listenTo: messageStore,
    fetch: {
      message: function message() {
        return messageStore['for'](this).getMessage(this.props.id);
      }
    },
    pending: function pending() {
      return this.done({
        message: {
          text: 'pending'
        }
      });
    },
    failed: function failed(errors) {
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
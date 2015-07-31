'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var _ = require('../../../mindash');

module.exports = function (Marty) {
  var MessageStore = (function (_Marty$Store) {
    _inherits(MessageStore, _Marty$Store);

    function MessageStore(options) {
      _classCallCheck(this, MessageStore);

      _get(Object.getPrototypeOf(MessageStore.prototype), 'constructor', this).call(this, options);
      this.state = {};
    }

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
            return this.app.messageAPI.getMessage(id);
          }
        });
      }
    }]);

    return MessageStore;
  })(Marty.Store);

  var MessageAPI = (function (_Marty$StateSource) {
    _inherits(MessageAPI, _Marty$StateSource);

    function MessageAPI(options) {
      _classCallCheck(this, MessageAPI);

      _get(Object.getPrototypeOf(MessageAPI.prototype), 'constructor', this).call(this, options);
      this.delay = 10;
    }

    _createClass(MessageAPI, [{
      key: 'getMessage',
      value: function getMessage(id) {
        var _this = this;

        return new Promise(function (resolve) {
          setTimeout(function () {
            _this.app.messageStore.addMessage(id, { text: 'remote' });
            resolve();
          }, _this.delay);
        });
      }
    }]);

    return MessageAPI;
  })(Marty.StateSource);

  var Message = (function (_React$Component) {
    _inherits(Message, _React$Component);

    function Message() {
      _classCallCheck(this, Message);

      _get(Object.getPrototypeOf(Message.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Message, [{
      key: 'render',
      value: function render() {
        var message = this.props.message;

        return React.createElement('div', { id: 'message' }, React.createElement('div', { className: 'text' }, message.text), React.createElement('div', { className: 'context' }, message.context));
      }
    }]);

    return Message;
  })(React.Component);

  var MessageContainer = Marty.createContainer(Message, {
    listenTo: 'messageStore',
    fetch: {
      message: function message() {
        return this.app.messageStore.getMessage(this.props.id);
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

  var App = (function (_Marty$Application) {
    _inherits(App, _Marty$Application);

    function App() {
      _classCallCheck(this, App);

      _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);

      this.register({
        messageAPI: MessageAPI,
        messageStore: MessageStore
      });
    }

    return App;
  })(Marty.Application);

  return {
    App: App,
    Message: MessageContainer
  };
};
'use strict';

var React = require('react');

module.exports = function (Marty) {
  var MessageStore = Marty.createStore({
    getInitialState: function getInitialState() {
      return {};
    },
    getMessage: function getMessage(message) {
      return this.fetch({
        id: message,
        locally: function locally() {
          return this.state[message];
        },
        remotely: function remotely() {
          var _this = this;

          return new Promise(function (resolve) {
            setTimeout(function () {
              _this.state[message] = message;
              resolve();
            }, 10);
          });
        }
      });
    }
  });

  var Application = Marty.createApplication(function () {
    this.register('messageStore', MessageStore);
  });

  var Child = React.createClass({
    displayName: 'Child',

    render: function render() {
      return React.createElement(
        'span',
        { id: "child" },
        this.props.message
      );
    }
  });

  var ChildContainer = Marty.createContainer(Child, {
    listenTo: 'messageStore',
    fetch: {
      message: function message() {
        return this.app.messageStore.getMessage('Child');
      }
    }
  });

  var Parent = React.createClass({
    displayName: 'Parent',

    render: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'span',
          { id: "parent" },
          this.props.message
        ),
        React.createElement(ChildContainer, null)
      );
    }
  });

  var ParentContainer = Marty.createContainer(Parent, {
    listenTo: 'messageStore',
    fetch: {
      message: function message() {
        return this.app.messageStore.getMessage('Parent');
      }
    }
  });

  return {
    Application: Application,
    Component: ParentContainer
  };
};
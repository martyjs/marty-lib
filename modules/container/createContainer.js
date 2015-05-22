'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('../mindash');
var inject = require('../core/inject');
var uuid = require('../core/utils/uuid');
var StoreObserver = require('../core/storeObserver');
var getFetchResult = require('./getFetchResult');
var getClassName = require('../core/utils/getClassName');

var RESERVED_FUNCTIONS = ['contextTypes', 'componentDidMount', 'onStoreChanged', 'componentWillUnmount', 'getInitialState', 'getState', 'render'];

module.exports = function (React) {
  var DEFAULT_CONTEXT_TYPES = {
    app: React.PropTypes.object };

  return function createContainer(InnerComponent, config) {
    config = config || {};

    if (!InnerComponent) {
      throw new Error('Must specify an inner component');
    }

    var id = uuid.type('Component');
    var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
    var contextTypes = _.extend({}, DEFAULT_CONTEXT_TYPES, config.contextTypes);

    InnerComponent.contextTypes = _.extend({}, DEFAULT_CONTEXT_TYPES, InnerComponent.contextTypes);

    inject(InnerComponent.prototype, config);

    var Container = React.createClass(_.extend({
      contextTypes: contextTypes,
      childContextTypes: {
        app: React.PropTypes.object
      },
      getChildContext: function getChildContext() {
        return { app: this.props.app };
      },
      componentDidMount: function componentDidMount() {
        var component = {
          id: id,
          displayName: innerComponentDisplayName
        };

        this.observer = new StoreObserver({
          app: this.app,
          component: component,
          stores: this.listenTo,
          onStoreChanged: this.onStoreChanged
        });

        if (_.isFunction(config.componentDidMount)) {
          config.componentDidMount.call(this);
        }
      },
      componentWillMount: function componentWillMount() {
        if (_.isFunction(config.componentWillMount)) {
          config.componentWillMount.call(this);
        }
      },
      componentWillReceiveProps: function componentWillReceiveProps(props) {
        this.props = props;
        this.setState(this.getState(props));

        if (_.isFunction(config.componentWillReceiveProps)) {
          config.componentWillReceiveProps.call(this, props);
        }
      },
      componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
        if (_.isFunction(config.componentWillUpdate)) {
          config.componentWillUpdate.call(this, nextProps, nextState);
        }
      },
      componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        if (_.isFunction(config.componentDidUpdate)) {
          config.componentDidUpdate.call(this, prevProps, prevState);
        }
      },
      onStoreChanged: function onStoreChanged() {
        this.setState(this.getState());
      },
      componentWillUnmount: function componentWillUnmount() {
        if (this.observer) {
          this.observer.dispose();
        }

        if (_.isFunction(config.componentWillUnmount)) {
          config.componentWillUnmount.call(this);
        }
      },
      getInitialState: function getInitialState() {
        inject(this, config);
        return this.getState();
      },
      getState: function getState() {
        return {
          result: getFetchResult(this)
        };
      },
      done: function done(results) {
        return React.createElement(InnerComponent, _extends({ ref: 'innerComponent' }, this.props, results, { app: this.app }));
      },
      getInnerComponent: function getInnerComponent() {
        return this.refs.innerComponent;
      },
      render: function render() {
        var container = this;
        var result = this.state.result;

        return result.when({
          done: function done(results) {
            if (_.isFunction(container.done)) {
              return container.done(results);
            }

            throw new Error('The `done` handler must be a function');
          },
          pending: function pending() {
            if (_.isFunction(container.pending)) {
              return container.pending(result.result);
            }

            return false;
          },
          failed: function failed(error) {
            if (_.isFunction(container.failed)) {
              return container.failed(error);
            }

            throw error;
          }
        });
      }
    }, _.omit(config, RESERVED_FUNCTIONS)));

    Container.InnerComponent = InnerComponent;
    Container.displayName = innerComponentDisplayName + 'Container';

    return Container;
  };
};
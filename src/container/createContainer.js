let _ = require('../mindash');
let inject = require('../core/inject');
let uuid = require('../core/utils/uuid');
let StoreObserver = require('../core/storeObserver');
let getFetchResult = require('./getFetchResult');
let getClassName = require('../core/utils/getClassName');

let RESERVED_FUNCTIONS = [
  'contextTypes',
  'componentDidMount',
  'onStoreChanged',
  'componentWillUnmount',
  'getInitialState',
  'getState',
  'render'
];

module.exports = function (React) {
  let DEFAULT_CONTEXT_TYPES = {
    app: React.PropTypes.object,
  };

  return function createContainer(InnerComponent, config) {
    config = config || {};

    if (!InnerComponent) {
      throw new Error('Must specify an inner component');
    }

    let id = uuid.type('Component');
    let innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
    let contextTypes = _.extend(
      {},
      DEFAULT_CONTEXT_TYPES,
      config.contextTypes
    );

    InnerComponent.contextTypes = _.extend(
      {},
      DEFAULT_CONTEXT_TYPES,
      InnerComponent.contextTypes
    );

    inject(InnerComponent.prototype, config);

    let Container = React.createClass(_.extend({
      contextTypes: contextTypes,
      childContextTypes: {
        app: React.PropTypes.object
      },
      getChildContext() {
        return { app: this.props.app };
      },
      componentDidMount() {
        let component = {
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
      componentWillMount() {
        if (_.isFunction(config.componentWillMount)) {
          config.componentWillMount.call(this);
        }
      },
      componentWillReceiveProps(props) {
        this.props = props;
        this.setState(this.getState(props));

        if (_.isFunction(config.componentWillReceiveProps)) {
          config.componentWillReceiveProps.call(this, props);
        }
      },
      componentWillUpdate(nextProps, nextState) {
        if (_.isFunction(config.componentWillUpdate)) {
          config.componentWillUpdate.call(this, nextProps, nextState);
        }
      },
      componentDidUpdate(prevProps, prevState) {
        if (_.isFunction(config.componentDidUpdate)) {
          config.componentDidUpdate.call(this, prevProps, prevState);
        }
      },
      onStoreChanged() {
        this.setState(this.getState());
      },
      componentWillUnmount() {
        if (this.observer) {
          this.observer.dispose();
        }

        if (_.isFunction(config.componentWillUnmount)) {
          config.componentWillUnmount.call(this);
        }
      },
      getInitialState() {
        inject(this, config);
        return this.getState();
      },
      getState() {
        return {
          result: getFetchResult(this)
        };
      },
      done(results) {
        return <InnerComponent ref="innerComponent" {...this.props} {...results} app={this.app} />;
      },
      getInnerComponent() {
        return this.refs.innerComponent;
      },
      render() {
        let container = this;
        let result = this.state.result;

        return result.when({
          done(results) {
            if (_.isFunction(container.done)) {
              return container.done(results);
            }

            throw new Error('The `done` handler must be a function');
          },
          pending() {
            if (_.isFunction(container.pending)) {
              return container.pending(result.result);
            }

            return false;
          },
          failed(error) {
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
let _ = require('../mindash');
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
  return function createContainer(InnerComponent, config) {
    config = config || {};

    if (!InnerComponent) {
      throw new Error('Must specify an inner component');
    }

    let id = uuid.type('Component');
    let innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
    let contextTypes = _.extend({
      app: React.PropTypes.object,
    }, config.contextTypes);

    let Container = React.createClass(_.extend({
      contextTypes: contextTypes,
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
        Object.defineProperty(this, 'app', {
          get: () => {
            if (this.context) {
              return this.context.app;
            }
          }
        });

        return this.getState();
      },
      getState() {
        return {
          result: getFetchResult(this)
        };
      },
      done(results) {
        return <InnerComponent ref="innerComponent" {...this.props} {...results} />;
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

            return <div></div>;
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

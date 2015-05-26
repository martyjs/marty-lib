let _ = require('../mindash');
let findApp = require('../core/findApp');
let uuid = require('../core/utils/uuid');
let getFetchResult = require('./getFetchResult');
let appProperty = require('../core/appProperty');
let StoreObserver = require('../core/storeObserver');
let getClassName = require('../core/utils/getClassName');

let RESERVED_FUNCTIONS = [
  'contextTypes',
  'componentDidMount',
  'componentWillReceiveProps',
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

    appProperty(InnerComponent.prototype);

    let specification = _.extend({
      contextTypes: contextTypes,
      childContextTypes: DEFAULT_CONTEXT_TYPES,
      getChildContext() {
        return { app: findApp(this) };
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
      },
      componentWillReceiveProps(props) {
        this.props = props;
        this.setState(this.getState(props));
      },
      onStoreChanged() {
        this.setState(this.getState());
      },
      componentWillUnmount() {
        if (this.observer) {
          this.observer.dispose();
        }
      },
      getInitialState() {
        appProperty(this);
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
    }, _.omit(config, RESERVED_FUNCTIONS));

    // Include lifecycle methods if specified in config. We don't need to
    // explicitly handle the ones that aren't in RESERVED_FUNCTIONS.
    specification.componentDidMount = callBoth(
      specification.componentDidMount, config.componentDidMount
    );

    specification.componentWillReceiveProps = callBothWithProps(
      specification.componentWillReceiveProps, config.componentWillReceiveProps
    );

    specification.componentWillUnmount = callBoth(
      specification.componentWillUnmount, config.componentWillUnmount
    );

    var Container = React.createClass(specification);

    Container.InnerComponent = InnerComponent;
    Container.displayName = innerComponentDisplayName + 'Container';

    return Container;

    function callBoth(func1, func2) {
      if (_.isFunction(func2)) {
        return function () {
          func1.call(this);
          func2.call(this);
        };
      } else {
        return func1;
      }
    }

    function callBothWithProps(func1, func2) {
      if (_.isFunction(func2)) {
        return function (props) {
          func1.call(this, props);
          func2.call(this, props);
        };
      } else {
        return func1;
      }
    }
  };
};
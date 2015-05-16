let _ = require('../mindash');
let inject = require('../core/inject');
let uuid = require('../core/utils/uuid');
let StoreObserver = require('../core/storeObserver');
let reservedKeys = ['listenTo', 'getState', 'getInitialState'];

module.exports = function (React) {
  return function createStateMixin(options) {
    if (!options) {
      throw new Error('The state mixin is expecting some options');
    }

    let instanceMethods = _.omit(options, reservedKeys);

    let mixin = _.extend({
      contextTypes: {
        app: React.PropTypes.object
      },
      componentDidMount: function () {
        let component = {
          id: this.__id,
          displayName: this.displayName || this.constructor.displayName,
        };

        this.__observer = new StoreObserver({
          component: component,
          app: this.context.app,
          stores: options.listenTo,
          onStoreChanged: this.onStoreChanged
        });
      },
      onStoreChanged: function () {
        this.setState(this.getState());
      },
      componentWillUnmount: function () {
        if (this.__observer) {
          this.__observer.dispose();
        }
      },
      componentWillReceiveProps: function (nextProps) {
        let oldProps = this.props;
        this.props = nextProps;

        let newState = this.getState();

        this.props = oldProps;
        this.setState(newState);
      },
      getState: function () {
        return (options.getState || _.noop).call(this);
      },
      getInitialState: function () {
        Object.defineProperty(this, 'app', {
          get: () => {
            if (this.context) {
              return this.context.app;
            }
          }
        });

        inject(this, options);

        let el = this._currentElement;

        if (!this.displayName && el && el.type) {
          this.displayName = el.type.displayName;
        }

        this.state = {};
        this.__id = uuid.type('Component');

        if (options.getInitialState) {
          this.state = options.getInitialState.call(this);
        }

        this.state = _.extend(this.state, this.getState());

        return this.state;
      }
    }, instanceMethods);

    return mixin;
  };
};
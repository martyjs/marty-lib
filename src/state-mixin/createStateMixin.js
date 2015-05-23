let _ = require('../mindash');
let findApp = require('../core/findApp');
let uuid = require('../core/utils/uuid');
let appProperty = require('../core/appProperty');
let StoreObserver = require('../core/storeObserver');
let reservedKeys = ['listenTo', 'getState', 'getInitialState'];

module.exports = function (React) {
  return function createStateMixin(options) {
    options = options || {};

    let instanceMethods = _.omit(options, reservedKeys);

    let contextTypes = {
      app: React.PropTypes.object
    };

    let mixin = _.extend({
      contextTypes: contextTypes,
      childContextTypes: contextTypes,
      getChildContext() {
        return { app: findApp(this) };
      },
      componentDidMount: function () {
        let component = {
          id: this.__id,
          displayName: this.displayName || this.constructor.displayName,
        };

        this.__observer = new StoreObserver({
          app: this.app,
          component: component,
          stores: options.listenTo || [],
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
        appProperty(this);

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
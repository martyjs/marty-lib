'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var React = require('react');
var sinon = require('sinon');
var _ = require('../../mindash');
var expect = require('chai').expect;
var _fetch = require('../../store/fetch');
var buildMarty = require('../../../test/lib/buildMarty');
var TestUtils = require('react/addons').addons.TestUtils;

describe('Container', function () {
  var Marty, InnerComponent, ContainerComponent, expectedProps, element, context, app;
  var initialProps, updateProps, handler, handlerContext, initialContext;

  beforeEach(function () {
    context = {
      foo: 'bar'
    };

    updateProps = sinon.spy();
    handler = sinon.spy(function () {
      handlerContext = this;
      return React.createElement('div', null);
    });

    Marty = buildMarty();

    app = new Marty.Application();

    app.register('store', Marty.createStore({
      getInitialState: function getInitialState() {
        return {};
      },
      addFoo: function addFoo(foo) {
        this.state[foo.id] = foo;
        this.hasChanged();
      },
      getFoo: function getFoo(id) {
        return this.state[id];
      }
    }));

    InnerComponent = React.createClass({
      displayName: 'InnerComponent',

      contextTypes: Marty.contextTypes,
      render: function render() {
        return React.createElement('div');
      },
      getInitialState: function getInitialState() {
        initialProps = this.props;
        initialContext = this.context;
        return {};
      },
      componentWillReceiveProps: updateProps,
      foo: function foo() {
        return { bar: 'baz' };
      }
    });
  });

  describe('when I dont pass in an inner component', function () {
    it('should throw an error', function () {
      expect(createContainerWithNoInnerComponent).to['throw'](Error);

      function createContainerWithNoInnerComponent() {
        Marty.createContainer();
      }
    });
  });

  describe('component lifestyle', function () {
    var ParentComponent;
    var componentWillReceiveProps;
    var componentWillUpdate;
    var componentDidUpdate;
    var componentDidMount;
    var componentWillUnmount;
    var componentWillMount;

    beforeEach(function () {
      componentWillReceiveProps = sinon.spy();
      componentWillUpdate = sinon.spy();
      componentDidUpdate = sinon.spy();
      componentDidMount = sinon.spy();
      componentWillUnmount = sinon.spy();
      componentWillMount = sinon.spy();

      ContainerComponent = wrap(InnerComponent, {
        componentWillReceiveProps: componentWillReceiveProps,
        componentWillUpdate: componentWillUpdate,
        componentDidUpdate: componentDidUpdate,
        componentDidMount: componentDidMount,
        componentWillUnmount: componentWillUnmount,
        componentWillMount: componentWillMount
      });

      ParentComponent = React.createClass({
        displayName: 'ParentComponent',

        render: function render() {
          return React.createElement(
            'div',
            null,
            React.createElement(ContainerComponent, { foo: this.state.foo })
          );
        },
        getInitialState: function getInitialState() {
          return {
            foo: 'bar'
          };
        }
      });

      element = TestUtils.renderIntoDocument(React.createElement(ParentComponent, null));

      element.setState({
        foo: 'baz'
      });

      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    });

    it('should call componentWillReceiveProps if passed in', function () {
      expect(componentWillReceiveProps).to.be.calledOnce;
    });

    it('should call componentWillUpdate if passed in', function () {
      expect(componentWillUpdate).to.be.calledOnce;
    });

    it('should call componentDidUpdate if passed in', function () {
      expect(componentDidUpdate).to.be.calledOnce;
    });

    it('should call componentDidMount if passed in', function () {
      expect(componentDidMount).to.be.calledOnce;
    });

    it('should call componentWillUnmount if passed in', function () {
      expect(componentWillUnmount).to.be.calledOnce;
    });

    it('should call componentWillMount if passed in', function () {
      expect(componentWillMount).to.be.calledOnce;
    });
  });

  describe('when I pass in a simple component', function () {
    beforeEach(function () {
      ContainerComponent = Marty.createContainer(InnerComponent);
    });

    it('should return a renderable component', function () {
      render(ContainerComponent);
    });

    it('should make the original component accessible at InnerComponent', function () {
      expect(ContainerComponent.InnerComponent).to.equal(InnerComponent);
    });

    it('should set the display name on classical React components', function () {
      expect(render(ContainerComponent).refs.subject.constructor.displayName).to.eql('InnerComponentContainer');
    });

    it('should set the display name on ES6 React components', function () {
      var ES6InnerComponent = (function (_React$Component) {
        function ES6InnerComponent() {
          _classCallCheck(this, ES6InnerComponent);

          if (_React$Component != null) {
            _React$Component.apply(this, arguments);
          }
        }

        _inherits(ES6InnerComponent, _React$Component);

        _createClass(ES6InnerComponent, [{
          key: 'render',
          value: function render() {
            return React.createElement('div');
          }
        }]);

        return ES6InnerComponent;
      })(React.Component);

      var ContainerES6Component = Marty.createContainer(ES6InnerComponent);
      expect(render(ContainerES6Component).refs.subject.constructor.displayName).to.eql('ES6InnerComponentContainer');
    });
  });

  describe('when fetch is a function', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: function fetch() {
          return {
            foo: 'bar',
            bar: _fetch.done({ baz: 'bam' })
          };
        }
      }));
    });

    it('should pass each of them to the inner component via props', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('#getInnerComponent()', function () {
    beforeEach(function () {
      ContainerComponent = wrap(InnerComponent, {
        something: function something() {
          return this.getInnerComponent();
        }
      });
      element = TestUtils.renderIntoDocument(React.createElement(ContainerComponent, null));
    });

    it('should return the inner component', function () {
      expect(element.getInnerComponent()).to.equal(element.refs.innerComponent);
    });

    it('should be accessible inside other functions', function () {
      expect(element.something()).to.equal(element.refs.innerComponent);
    });
  });

  describe('when I pass in contextTypes', function () {
    beforeEach(function () {
      element = wrap(InnerComponent, {
        contextTypes: {
          foo: React.PropTypes.object
        }
      });
    });

    it('should include them in the containers contextTypes', function () {
      expect(element.contextTypes.foo).to.eql(React.PropTypes.object);
    });
  });

  describe('when I pass props to the container component', function () {
    beforeEach(function () {
      expectedProps = { foo: 'bar' };
      element = render(wrap(InnerComponent), expectedProps);
    });

    it('should pass them through to the inner component', function () {
      expect(initialProps).to.eql(expectedProps);
    });
  });

  describe('when I fetch a simple value', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return 'bar';
          }
        }
      }));
    });

    it('should pass that value to the inner component via props', function () {
      expect(initialProps).to.eql({ foo: 'bar' });
    });
  });

  describe('when the parent updates its props then it should update its childrens', function () {
    var ParentComponent, fetch;

    beforeEach(function () {
      fetch = sinon.spy();
      ContainerComponent = wrap(InnerComponent, {
        fetch: {
          bar: function bar() {
            fetch(this.props);
            return 'bam';
          }
        }
      });

      ParentComponent = React.createClass({
        displayName: 'ParentComponent',

        getInitialState: function getInitialState() {
          return {
            foo: 'bar'
          };
        },
        render: function render() {
          return React.createElement(
            'div',
            null,
            React.createElement(ContainerComponent, { foo: this.state.foo })
          );
        }
      });

      var element = TestUtils.renderIntoDocument(React.createElement(ParentComponent, null));

      element.replaceState({
        foo: 'baz'
      });
    });

    it('should update the inner components props', function () {
      expect(updateProps).to.be.calledWith({
        foo: 'baz',
        bar: 'bam'
      });
    });

    it('should refresh the props', function () {
      expect(fetch).to.be.calledWith({
        foo: 'baz'
      });
    });
  });

  describe('when I fetch multiple values', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return 'bar';
          },
          bar: function bar() {
            return { baz: 'bam' };
          }
        }
      }));
    });

    it('should pass each of them to the inner component via props', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('when all of the fetchs are done and a done handler is not implemented', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.done('bar');
          },
          bar: function bar() {
            return _fetch.done({ baz: 'bam' });
          }
        }
      }));
    });

    it('should pass that value through to the child', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('when you are fetching from a store', function () {
    var finishQuery, expectedId;

    beforeEach(function (done) {
      expectedId = 456;
      app.register('barStore', Marty.createStore({
        id: 'BarContainerStore',
        getInitialState: function getInitialState() {
          return {};
        },
        addBar: function addBar(bar) {
          this.state[bar.id] = bar;
          this.hasChanged();
        },
        getBar: function getBar(id) {
          return this.fetch({
            id: 'bar-' + id,
            locally: function locally() {
              return this.state[id];
            },
            remotely: function remotely() {
              return new Promise((function (resolve) {
                this.addBar({ id: id });
                finishQuery = resolve;
              }).bind(this));
            }
          });
        }
      }));

      ContainerComponent = app.bindTo(wrap(InnerComponent, {
        listenTo: 'barStore',
        fetch: {
          bar: function bar() {
            return this.app.barStore.getBar(expectedId);
          }
        }
      }));

      element = TestUtils.renderIntoDocument(React.createElement(ContainerComponent, null));

      finishQuery();

      setTimeout(done, 1);
    });

    it('should render the inner component when the fetch is complete', function () {
      expect(initialProps).to.eql({
        bar: { id: expectedId }
      });
    });
  });

  describe('when you pass in other functions', function () {
    beforeEach(function () {
      ContainerComponent = wrap(InnerComponent, {
        something: function something() {
          return [this, 'foo'];
        }
      });

      element = TestUtils.renderIntoDocument(React.createElement(ContainerComponent, null));
    });

    it('should expose the function with the element as the context', function () {
      expect(element.something()).to.eql([element, 'foo']);
    });
  });

  describe('when the component is bound to an application', function () {
    var application, actualApplication;

    beforeEach(function () {
      application = new Marty.Application();
      ContainerComponent = application.bindTo(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            actualApplication = this.app;

            return {};
          }
        }
      }));

      element = TestUtils.renderIntoDocument(React.createElement(ContainerComponent, null));
    });

    it('should make the application accessible on `this.app`', function () {
      expect(actualApplication).to.equal(application);
    });
  });

  describe('when all of the fetchs are done and a done handler is implemented', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.done('bar');
          },
          bar: function bar() {
            return _fetch.done({ baz: 'bam' });
          }
        },
        done: handler
      }));
    });

    it('should call the handler with the results and component', function () {
      var expectedResults = {
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      };

      expect(handler).to.be.calledWith(expectedResults);
    });
  });

  describe('when a fetch is pending and there is a pending handler', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.done('bar');
          },
          bar: function bar() {
            return _fetch.pending();
          }
        },
        pending: handler
      }));
    });

    it('should call the handler with the fetches and component', function () {
      expect(handler).to.be.calledOnce;
    });
  });

  describe('when a fetch failed and there is a failed handler', function () {
    var fooError, barError;

    beforeEach(function () {
      fooError = new Error('foo');
      barError = new Error('bar');

      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.failed(fooError);
          },
          bar: function bar() {
            return _fetch.failed(barError);
          },
          baz: function baz() {
            return _fetch.done({});
          },
          bam: function bam() {
            return _fetch.pending();
          }
        },
        failed: handler
      }));
    });

    it('should call the handler with the errors and component', function () {
      var expectedErrors = {
        foo: fooError,
        bar: barError
      };

      expect(handler).to.be.calledWith(expectedErrors);
    });
  });

  describe('when a fetch failed and there is no failed handler', function () {
    var fooError;

    beforeEach(function () {
      fooError = new Error('foo');
    });

    it('should throw an error', function () {
      expect(noFailedHandler).to['throw']({
        foo: fooError
      });

      function noFailedHandler() {
        render(wrap(InnerComponent, {
          fetch: {
            foo: function foo() {
              return _fetch.failed(fooError);
            }
          }
        }));
      }
    });
  });

  describe('when I listen to the id of a store', function () {
    var expectedResult;

    beforeEach(function () {
      var app = new Marty.Application();

      app.register('foo', Marty.createStore({
        getInitialState: function getInitialState() {
          return {};
        },
        addFoo: function addFoo(foo) {
          this.state[foo.id] = foo;
          this.hasChanged();
        },
        getFoo: function getFoo(id) {
          return this.state[id];
        }
      }));

      element = render(app.bindTo(wrap(InnerComponent, {
        listenTo: 'foo',
        fetch: {
          foo: function foo() {
            return this.app.foo.getFoo(123);
          }
        }
      })));

      expectedResult = { id: 123 };
      app.foo.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', function () {
      expect(updateProps).to.be.calledWith({
        foo: expectedResult
      });
    });
  });

  describe('when I listen to a store', function () {
    var expectedResult;

    beforeEach(function () {
      element = render(app.bindTo(wrap(InnerComponent, {
        listenTo: 'store',
        fetch: {
          foo: function foo() {
            return this.app.store.getFoo(123);
          }
        }
      })));

      expectedResult = { id: 123 };
      app.store.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', function () {
      expect(updateProps).to.be.calledWith({
        foo: expectedResult
      });
    });
  });

  describe('when calling a fetch handler', function () {
    var expectedResult, _failed;

    beforeEach(function () {
      _failed = sinon.spy();
      expectedResult = { id: 123 };
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.pending();
          }
        },
        result: expectedResult,
        pending: function pending() {
          return this.failed();
        },
        failed: function failed() {
          _failed(this.result);
          return this.done();
        }
      }));
    });

    it('should allow me to call anything else in the config', function () {
      expect(_failed).to.be.calledWith(expectedResult);
    });
  });

  function wrap(InnerComponent, containerOptions) {
    return Marty.createContainer(InnerComponent, containerOptions);
  }

  function render(Component, props) {
    var ContextContainer = React.createClass({
      displayName: 'ContextContainer',

      render: function render() {
        var innerProps = _.extend({}, this.props, props, { ref: 'subject' });

        return React.createElement(Component, innerProps);
      }
    });

    return TestUtils.renderIntoDocument(React.createElement(ContextContainer, null));
  }
});
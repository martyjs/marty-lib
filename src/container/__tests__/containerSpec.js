var React = require('react');
var sinon = require('sinon');
var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var _ = require('../../mindash');
var fetch = require('../../store/fetch');
var TestUtils = require('react/addons').addons.TestUtils;

describe('Container', () => {
  var Marty, InnerComponent, ContainerComponent, expectedProps, element, context;
  var initialProps, updateProps, Store, handler, handlerContext, fetchContext, initialContext;

  beforeEach(() => {
    context = {
      foo: 'bar'
    };

    updateProps = sinon.spy();
    handler = sinon.spy(function () {
      handlerContext = this;
      return <div></div>;
    });

    Marty = buildMarty();
    Marty.isASingleton = true;

    Store = Marty.createStore({
      id: 'ContainerStore',
      getInitialState() {
        return {};
      },
      addFoo(foo) {
        this.state[foo.id] = foo;
        this.hasChanged();
      },
      getFoo(id) {
        return this.state[id];
      }
    });

    InnerComponent = React.createClass({
      contextTypes: Marty.contextTypes,
      render() {
        return React.createElement('div');
      },
      getInitialState() {
        initialProps = this.props;
        initialContext = this.context;
        return {};
      },
      componentWillReceiveProps: updateProps,
      foo() {
        return { bar: 'baz' };
      }
    });
  });

  describe('when I dont pass in an inner component', () => {
    it('should throw an error', () => {
      expect(createContainerWithNoInnerComponent).to.throw(Error);

      function createContainerWithNoInnerComponent() {
        Marty.createContainer();
      }
    });
  });

  describe('component lifestyle', () => {
    var ParentComponent;
    var componentWillReceiveProps;
    var componentWillUpdate;
    var componentDidUpdate;
    var componentDidMount;
    var componentWillUnmount;
    var componentWillMount;

    beforeEach(() => {
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
        render() {
          return <div><ContainerComponent foo={this.state.foo} /></div>;
        },
        getInitialState() {
          return {
            foo: 'bar'
          };
        }
      });

      element = TestUtils.renderIntoDocument(<ParentComponent />);

      element.setState({
        foo: 'baz'
      });

      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    });

    it('should call componentWillReceiveProps if passed in', () => {
      expect(componentWillReceiveProps).to.be.calledOnce;
    });

    it('should call componentWillUpdate if passed in', () => {
      expect(componentWillUpdate).to.be.calledOnce;
    });

    it('should call componentDidUpdate if passed in', () => {
      expect(componentDidUpdate).to.be.calledOnce;
    });

    it('should call componentDidMount if passed in', () => {
      expect(componentDidMount).to.be.calledOnce;
    });

    it('should call componentWillUnmount if passed in', () => {
      expect(componentWillUnmount).to.be.calledOnce;
    });

    it('should call componentWillMount if passed in', () => {
      expect(componentWillMount).to.be.calledOnce;
    });
  });

  describe('when I pass in a simple component', () => {
    beforeEach(() => {
      ContainerComponent = Marty.createContainer(InnerComponent);
    });

    it('should return a renderable component', () => {
      render(ContainerComponent);
    });

    it('should make the original component accessible at InnerComponent', () => {
      expect(ContainerComponent.InnerComponent).to.equal(InnerComponent);
    });

    it('should set the display name on classical React components', () => {
      expect(render(ContainerComponent).refs.subject.constructor.displayName).to.eql('InnerComponentContainer');
    });

    it('should set the display name on ES6 React components', () => {
      class ES6InnerComponent extends React.Component {
        render() {
          return React.createElement('div');
        }
      }

      let ContainerES6Component = Marty.createContainer(ES6InnerComponent);
      expect(render(ContainerES6Component).refs.subject.constructor.displayName).to.eql('ES6InnerComponentContainer');
    });
  });

  describe('when fetch is a function', () => {
    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        fetch() {
          return {
            foo: 'bar',
            bar: fetch.done({ baz: 'bam' })
          };
        }
      }));
    });

    it('should pass each of them to the inner component via props', () => {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('#getInnerComponent()', () => {
    beforeEach(() => {
      ContainerComponent = wrap(InnerComponent, {
        something() {
          return this.getInnerComponent();
        }
      });
      element = TestUtils.renderIntoDocument(<ContainerComponent />);
    });

    it('should return the inner component', () => {
      expect(element.getInnerComponent()).to.equal(element.refs.innerComponent);
    });

    it('should be accessible inside other functions', () => {
      expect(element.something()).to.equal(element.refs.innerComponent);
    });
  });

  describe('when I pass in contextTypes', () => {
    beforeEach(() => {
      element = wrap(InnerComponent, {
        contextTypes: {
          foo: React.PropTypes.object
        }
      });
    });

    it('should include them in the containers contextTypes', () => {
      expect(element.contextTypes.foo).to.eql(React.PropTypes.object);
    });
  });

  describe('when I pass props to the container component', () => {
    beforeEach(() => {
      expectedProps = { foo: 'bar' };
      element = render(wrap(InnerComponent), expectedProps);
    });

    it('should pass them through to the inner component', () => {
      expect(initialProps).to.eql(expectedProps);
    });
  });

  describe('when I fetch a simple value', () => {
    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            fetchContext = this;
            return 'bar';
          }
        }
      }));
    });

    it('should pass that value to the inner component via props', () => {
      expect(initialProps).to.eql({ foo: 'bar' });
    });

    it('should make the marty context available in the current context', () => {
      expect(fetchContext.context.marty).to.eql(context);
    });
  });

  describe('when the parent updates its props then it should update its childrens', () => {
    var ParentComponent, fetch;

    beforeEach(() => {
      fetch = sinon.spy();
      ContainerComponent = wrap(InnerComponent, {
        fetch: {
          bar: function () {
            fetch(this.props);
            return 'bam';
          }
        }
      });

      ParentComponent = React.createClass({
        getInitialState() {
          return {
            foo: 'bar'
          };
        },
        render() {
          return <div><ContainerComponent foo={this.state.foo} /></div>;
        }
      });

      var element = TestUtils.renderIntoDocument(<ParentComponent />);

      element.replaceState({
        foo: 'baz'
      });
    });

    it('should update the inner components props', () => {
      expect(updateProps).to.be.calledWith({
        foo: 'baz',
        bar: 'bam'
      });
    });

    it('should refresh the props', () => {
      expect(fetch).to.be.calledWith({
        foo: 'baz'
      });
    });
  });

  describe('when I fetch multiple values', () => {
    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            return 'bar';
          },
          bar() {
            return { baz: 'bam' };
          }
        }
      }));
    });

    it('should pass each of them to the inner component via props', () => {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });

    it('should make the marty context available in the current context', () => {
      expect(fetchContext.context.marty).to.eql(context);
    });
  });

  describe('when all of the fetchs are done and a done handler is not implemented', () => {
    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            return fetch.done('bar');
          },
          bar() {
            return fetch.done({ baz: 'bam' });
          }
        }
      }));
    });

    it('should pass that value through to the child', () => {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('when you are fetching from a store', () => {
    var BarStore, finishQuery, expectedId;

    beforeEach(() => {
      expectedId = 456;
      BarStore = Marty.createStore({
        id: 'BarContainerStore',
        getInitialState() {
          return {};
        },
        addBar(bar) {
          this.state[bar.id] = bar;
          this.hasChanged();
        },
        getBar(id) {
          return this.fetch({
            id: 'bar-' + id,
            locally() {
              return this.state[id];
            },
            remotely() {
              return new Promise(function (resolve) {
                this.addBar({ id: id });
                finishQuery = resolve;
              }.bind(this));
            }
          });
        }
      });
    });

    describe('when the store is resolved to a context', () => {
      beforeEach(function (done) {
        ContainerComponent = wrap(InnerComponent, {
          listenTo: BarStore,
          fetch: {
            bar() {
              return BarStore.for(this).getBar(expectedId);
            }
          }
        });

        element = TestUtils.renderIntoDocument(<ContainerComponent />);

        finishQuery();

        setTimeout(done, 1);
      });

      it('should render the inner component when the fetch is complete', () => {
        expect(initialProps).to.eql({
          bar: { id: expectedId }
        });
      });
    });

    describe('when calling the store directly', () => {
      beforeEach(function (done) {
        ContainerComponent = wrap(InnerComponent, {
          listenTo: BarStore,
          fetch: {
            bar() {
              return BarStore.getBar(expectedId);
            }
          }
        });

        element = TestUtils.renderIntoDocument(<ContainerComponent />);

        finishQuery();

        setTimeout(done, 1);
      });

      it('should render the inner component when the fetch is complete', () => {
        expect(initialProps).to.eql({
          bar: { id: expectedId }
        });
      });
    });
  });

  describe('when you pass in other functions', () => {
    beforeEach(() => {
      ContainerComponent = wrap(InnerComponent, {
        something() {
          return [this, 'foo'];
        }
      });

      element = TestUtils.renderIntoDocument(<ContainerComponent />);
    });

    it('should expose the function with the element as the context', () => {
      expect(element.something()).to.eql([element, 'foo']);
    });
  });

  describe('when the component is bound to an application', () => {
    var application, actualApplication;

    beforeEach(() => {
      application = new Marty.Application();
      ContainerComponent = application.bindTo(wrap(InnerComponent, {
        fetch: {
          foo() {
            actualApplication = this.app;

            return {};
          }
        }
      }));

      element = TestUtils.renderIntoDocument(<ContainerComponent />);
    });

    it('should make the application accessible on `this.app`', () => {
      expect(actualApplication).to.equal(application);
    });
  });

  describe('when all of the fetchs are done and a done handler is implemented', () => {
    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            return fetch.done('bar');
          },
          bar() {
            return fetch.done({ baz: 'bam' });
          }
        },
        done: handler
      }));
    });

    it('should call the handler with the results and component', () => {
      var expectedResults = {
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      };

      expect(handler).to.be.calledWith(expectedResults);
    });
  });

  describe('when a fetch is pending and there is a pending handler', () => {
    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            return fetch.done('bar');
          },
          bar() {
            return fetch.pending();
          }
        },
        pending: handler
      }));
    });

    it('should call the handler with the fetches and component', () => {
      expect(handler).to.be.calledOnce;
    });

    it('should make the marty context available in the current context', () => {
      expect(fetchContext.context.marty).to.eql(context);
    });
  });

  describe('when a fetch failed and there is a failed handler', () => {
    var fooError, barError;

    beforeEach(() => {
      fooError = new Error('foo');
      barError = new Error('bar');

      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            return fetch.failed(fooError);
          },
          bar() {
            return fetch.failed(barError);
          },
          baz() {
            return fetch.done({});
          },
          bam() {
            return fetch.pending();
          }
        },
        failed: handler
      }));
    });

    it('should call the handler with the errors and component', () => {
      var expectedErrors = {
        foo: fooError,
        bar: barError
      };

      expect(handler).to.be.calledWith(expectedErrors);
    });

    it('should make the marty context available in the current context', () => {
      expect(fetchContext.context.marty).to.eql(context);
    });
  });

  describe('when a fetch failed and there is no failed handler', () => {
    var fooError;

    beforeEach(() => {
      fooError = new Error('foo');
    });

    it('should throw an error', () => {
      expect(noFailedHandler).to.throw({
        foo: fooError
      });

      function noFailedHandler() {
        render(wrap(InnerComponent, {
          fetch: {
            foo() {
              return fetch.failed(fooError);
            }
          }
        }));
      }
    });
  });

  describe('when I listen to the id of a store', () => {
    var expectedResult;

    beforeEach(() => {
      Marty.isASingleton = false;

      var app = new Marty.Application();

      app.register('foo', Marty.createStore({
        getInitialState() {
          return {};
        },
        addFoo(foo) {
          this.state[foo.id] = foo;
          this.hasChanged();
        },
        getFoo(id) {
          return this.state[id];
        }
      }));

      element = render(app.bindTo(wrap(InnerComponent, {
        listenTo: 'foo',
        fetch: {
          foo() {
            return this.app.foo.getFoo(123);
          }
        }
      })));

      expectedResult = { id: 123 };
      app.foo.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', () => {
      expect(updateProps).to.be.calledWith({
        foo: expectedResult
      });
    });
  });

  describe('when I listen to a store', () => {
    var expectedResult;

    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        listenTo: Store,
        fetch: {
          foo() {
            return Store.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      Store.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', () => {
      expect(updateProps).to.be.calledWith({
        foo: expectedResult
      });
    });
  });

  describe('when calling a fetch handler', () => {
    var expectedResult, failed;

    beforeEach(() => {
      failed = sinon.spy();
      expectedResult = { id: 123 };
      element = render(wrap(InnerComponent, {
        fetch: {
          foo() {
            return fetch.pending();
          }
        },
        result: expectedResult,
        pending() {
          return this.failed();
        },
        failed() {
          failed(this.result);
          return this.done();
        }
      }));
    });

    it('should allow me to call anything else in the config', () => {
      expect(failed).to.be.calledWith(expectedResult);
    });
  });

  function wrap(InnerComponent, containerOptions) {
    return Marty.createContainer(InnerComponent, containerOptions);
  }

  function render(Component, props) {
    var ContextContainer = React.createClass({
      childContextTypes: {
        marty: React.PropTypes.object.isRequired
      },
      getChildContext: function () {
        return {
          marty: context
        };
      },
      render: function () {
        var innerProps = _.extend({}, this.props, props, { ref: 'subject' });

        return <Component {...innerProps} />;
      }
    });

    return TestUtils.renderIntoDocument(<ContextContainer />);
  }
});

let React = require('react');
let sinon = require('sinon');
let _ = require('../../mindash');
let expect = require('chai').expect;
let fetch = require('../../store/fetch');
let buildMarty = require('../../../test/lib/buildMarty');
let { renderIntoDocument } = require('react/addons').addons.TestUtils;

describe('Container', () => {
  let Marty, InnerComponent, ContainerComponent, expectedProps, element, context, app;
  let initialProps, updatedProps, handler, handlerContext, initialContext, innerFunctionContext;

  beforeEach(() => {
    context = {
      foo: 'bar'
    };

    handler = sinon.spy(function () {
      handlerContext = this;
      return <div></div>;
    });

    Marty = buildMarty();

    app = new Marty.Application();

    app.register('store', Marty.createStore({
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

    InnerComponent = React.createClass({
      contextTypes: Marty.contextTypes,
      render() {
        return React.createElement('div');
      },
      getInitialState() {
        innerFunctionContext = this;
        initialContext = this.context;
        initialProps = withoutApp(this.props);
        return {};
      },
      componentWillReceiveProps: function (props) {
        updatedProps = withoutApp(props);
      },
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
    let ParentComponent;
    let componentWillReceiveProps;
    let componentWillUpdate;
    let componentDidUpdate;
    let componentDidMount;
    let componentWillUnmount;
    let componentWillMount;

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

      element = renderIntoDocument(<ParentComponent app={app} />);

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

  describe.only('when a container transitions from a pending to done state', () => {
    let output, instance;

    beforeEach(() => {
      app = new Marty.Application();

      app.register('store', Marty.createStore({
        getInitialState() {
          return {
            message: fetch.pending()
          };
        },
        getMessage() {
          return this.state.message;
        },
        setMessage(message) {
          this.state.message = fetch.done(message);
          this.hasChanged();
        }
      }));

      let Inner = React.createClass({
        render() {
          return <span>done</span>;
        }
      });

      let Container = Marty.createContainer(Inner, {
        listenTo: 'store',
        fetch: {
          message() {
            return this.app.store.getMessage();
          }
        },
        pending() {
          return <span>pending</span>;
        }
      });

      element = renderIntoDocument(<Container app={app} />);

      app.store.setMessage('foo');

      console.log(element.getDOMNode());
    });

    it('should only show the new state', () => {
      console.log(output);
      expect(output).to.not.contain('<span>pending</span>');
    });
  });

  describe('when the component is bound to an application', () => {
    let actualApplication;

    beforeEach(() => {
      app = new Marty.Application();

      class TestComponent extends React.Component {
        constructor(props, context) {
          super(props, context);
          actualApplication = props.app;
        }
        render() {
          return false;
        }
      }

      let WrappedComponent = Marty.createContainer(TestComponent);

      renderIntoDocument(<WrappedComponent app={app} />);
    });

    it('should pass the app down through the props', () => {
      expect(actualApplication).to.equal(app);
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
      expect(render(ContainerComponent).constructor.displayName).to.eql('InnerComponentContainer');
    });

    it('should set the display name on ES6 React components', () => {
      class ES6InnerComponent extends React.Component {
        render() {
          return React.createElement('div');
        }
      }

      let ContainerES6Component = wrap(ES6InnerComponent);

      expect(render(ContainerES6Component).constructor.displayName).to.eql('ES6InnerComponentContainer');
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
      element = renderIntoDocument(<ContainerComponent app={app} />);
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
            return 'bar';
          }
        }
      }));
    });

    it('should pass that value to the inner component via props', () => {
      expect(initialProps).to.eql({ foo: 'bar' });
    });
  });

  describe('when the parent updates its props then it should update its childrens', () => {
    let ParentComponent, fetch;

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

      let element = renderIntoDocument(<ParentComponent app={app} />);

      element.replaceState({
        foo: 'baz'
      });
    });

    it('should update the inner components props', () => {
      expect(updatedProps).to.eql({
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
    let finishQuery, expectedId;

    beforeEach((done) => {
      expectedId = 456;
      app.register('barStore', Marty.createStore({
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
      }));

      ContainerComponent = wrap(InnerComponent, {
        listenTo: 'barStore',
        fetch: {
          bar() {
            return this.app.barStore.getBar(expectedId);
          }
        }
      });

      element = renderIntoDocument(<ContainerComponent app={app} />);

      finishQuery();

      setTimeout(done, 1);
    });

    it('should render the inner component when the fetch is complete', () => {
      expect(initialProps).to.eql({
        bar: { id: expectedId }
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

      element = renderIntoDocument(<ContainerComponent app={app} />);
    });

    it('should expose the function with the element as the context', () => {
      expect(element.something()).to.eql([element, 'foo']);
    });
  });

  describe('when the component is bound to an application', () => {
    let actualApplication;

    beforeEach(() => {
      app = new Marty.Application();
      ContainerComponent = wrap(InnerComponent, {
        fetch: {
          foo() {
            actualApplication = this.app;

            return {};
          }
        }
      });

      element = renderIntoDocument(<ContainerComponent app={app} />);
    });

    it('should make the application accessible on `this.app`', () => {
      expect(actualApplication).to.equal(app);
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
      let expectedResults = {
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
          },
          baz() {
            return fetch.done('bam');
          }
        },
        pending: handler
      }));
    });

    it('should call the handler with the fetches and component', () => {
      expect(handler).to.be.calledOnce;
    });

    it('should pass in all the fetch results that have finished', function () {
      expect(handler).to.be.calledWith({
        foo: 'bar',
        baz: 'bam'
      });
    });
  });

  describe('when a fetch failed and there is a failed handler', () => {
    let fooError, barError;

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
      let expectedErrors = {
        foo: fooError,
        bar: barError
      };

      expect(handler).to.be.calledWith(expectedErrors);
    });
  });

  describe('when a fetch failed and there is no failed handler', () => {
    let fooError;

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
    let expectedResult;

    beforeEach(() => {
      app = new Marty.Application();

      app.register('fooStore', Marty.createStore({
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

      element = render(wrap(InnerComponent, {
        listenTo: 'fooStore',
        fetch: {
          foo() {
            return this.app.fooStore.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      app.fooStore.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', () => {
      expect(updatedProps).to.eql({
        foo: expectedResult
      });
    });
  });

  describe('when I listen to a store', () => {
    let expectedResult;

    beforeEach(() => {
      element = render(wrap(InnerComponent, {
        listenTo: 'store',
        fetch: {
          foo() {
            return this.app.store.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      app.store.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', () => {
      expect(updatedProps).to.eql({
        foo: expectedResult
      });
    });
  });

  describe('when calling a fetch handler', () => {
    let expectedResult, failed;

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

  function withoutApp(props) {
    return _.omit(props, 'app');
  }

  function wrap(InnerComponent, containerOptions) {
    return Marty.createContainer(InnerComponent, containerOptions);
  }

  function render(Component, props) {
    return renderIntoDocument(<Component app={app} {...props} />);
  }
});

let Context = require('./context');
let renderToString = require('./renderToString');

module.exports = function (marty, React) {
  marty.register('createContext', createContext);
  marty.register('renderToString', renderToString(React));

  function createContext() {
    return new Context(this.registry);
  }
};
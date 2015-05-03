var Context = require('./lib/context');
var renderToString = require('./lib/renderToString');

module.exports = function (marty, React) {
  marty.register('createContext', createContext);
  marty.register('renderToString', renderToString(React));

  function createContext() {
    return new Context(this.registry);
  }
};
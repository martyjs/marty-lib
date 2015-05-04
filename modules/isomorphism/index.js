'use strict';

var Context = require('./context');
var renderToString = require('./renderToString');

module.exports = function (marty, React) {
  marty.register('createContext', createContext);
  marty.register('renderToString', renderToString(React));

  function createContext() {
    if (this.warnings.appIsTheFuture) {
      this.logger.warn('Warning: Contexts are being depreciated. ' + 'Please move to using application\'s instead. ' + 'http://martyjs.org/depreciated/contexts.html');
    }

    return dispatcher;

    return new Context(this.registry);
  }
};
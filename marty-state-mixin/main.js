var _ = require('marty-core/lib/mindash');
var StateMixin = require('./lib/stateMixin');

module.exports = function (marty, React) {
  marty.register('createStateMixin', createStateMixin);

  function createStateMixin(options) {
    return new StateMixin(_.defaults(options, {
      React: React
    }));
  }
};
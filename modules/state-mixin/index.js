let _ = require('../mindash');
let StateMixin = require('./stateMixin');

module.exports = function (marty, React) {
  marty.register('createStateMixin', createStateMixin);

  function createStateMixin(options) {
    return new StateMixin(_.defaults(options, {
      React: React
    }));
  }
};
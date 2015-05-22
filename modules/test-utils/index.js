'use strict';

module.exports = {
  dispatch: require('./dispatch'),
  createStore: require('./createStore'),
  hasDispatched: require('./hasDispatched'),
  createApplication: require('./createApplication'),
  renderIntoDocument: require('./renderIntoDocument'),
  getDispatchedActionsWithType: require('./getDispatchedActionsWithType')
};
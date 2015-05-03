var autoDispatch = require('./lib/autoDispatch');
var ActionCreators = require('./lib/actionCreators');
var createActionCreatorsClass = require('./lib/createActionCreatorsClass');

module.exports = function (marty) {
  marty.register('autoDispatch', autoDispatch);
  marty.registerClass('ActionCreators', ActionCreators);
  marty.register('createActionCreators', createActionCreators);

  function createActionCreators(properties) {
    var ActionCreatorsClass = createActionCreatorsClass(properties);
    var defaultInstance = this.register(ActionCreatorsClass);

    return defaultInstance;
  }
};
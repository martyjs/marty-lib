let autoDispatch = require('./autoDispatch');
let ActionCreators = require('./actionCreators');
let createActionCreatorsClass = require('./createActionCreatorsClass');

module.exports = function (marty) {
  marty.register('autoDispatch', autoDispatch);
  marty.registerClass('ActionCreators', ActionCreators);
  marty.register('createActionCreators', createActionCreators);

  function createActionCreators(properties) {
    let ActionCreatorsClass = createActionCreatorsClass(properties);
    let defaultInstance = this.register(ActionCreatorsClass);

    return defaultInstance;
  }
};
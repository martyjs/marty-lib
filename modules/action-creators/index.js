'use strict';

var autoDispatch = require('./autoDispatch');
var ActionCreators = require('./actionCreators');
var createActionCreatorsClass = require('./createActionCreatorsClass');

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
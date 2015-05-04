'use strict';

var autoDispatch = require('./autoDispatch');
var ActionCreators = require('./actionCreators');

module.exports = function (marty) {
  marty.register('autoDispatch', autoDispatch);
  marty.registerClass('ActionCreators', ActionCreators);
  marty.register('createActionCreators', require('./createActionCreatorsClass'));
};
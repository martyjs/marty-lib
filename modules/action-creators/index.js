'use strict';

module.exports = function (marty) {
  marty.autoDispatch = require('./autoDispatch');
  marty.ActionCreators = require('./actionCreators');
  marty.createActionCreators = require('./createActionCreatorsClass');
};
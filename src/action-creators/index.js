let autoDispatch = require('./autoDispatch');
let ActionCreators = require('./actionCreators');

module.exports = function (marty) {
  marty.register('autoDispatch', autoDispatch);
  marty.registerClass('ActionCreators', ActionCreators);
  marty.register('createActionCreators', require('./createActionCreatorsClass'));
};
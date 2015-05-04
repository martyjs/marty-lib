let _ = require('../mindash');
let log = require('../core/logger');
let warnings = require('../core/warnings');

function constants(obj) {
  return toConstant(obj);

  function toConstant(obj) {
    if (!obj) {
      return {};
    }

    if (_.isArray(obj)) {
      return arrayToConstants(obj);
    }

    if (_.isObject(obj)) {
      return objectToConstants(obj);
    }
  }

  function objectToConstants(obj) {
    return _.object(_.map(obj, valueToArray));

    function valueToArray(value, actionType) {
      return [actionType, toConstant(value)];
    }
  }

  function arrayToConstants(array) {
    let constants = {};

    _.each(array, function (actionType) {
      let types = [
        actionType,
        actionType + '_STARTING',
        actionType + '_DONE',
        actionType + '_FAILED'
      ];

      _.each(types, function (type) {
        constants[type] = type;
      });
    });

    return constants;
  }
}

module.exports = constants;
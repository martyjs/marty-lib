var constants = require('./constants');

module.exports = function (marty) {
  marty.register('createConstants', createConstants);

  function createConstants(obj) {
    return constants(obj);
  }
};

module.exports.constants = constants;
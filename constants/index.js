var constants = require('./lib/constants');

module.exports = function (marty) {
  marty.register('createConstants', createConstants);

  function createConstants(obj) {
    return constants(obj);
  }
};

module.exports.constants = constants;
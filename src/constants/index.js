let constants = require('./constants');

module.exports = function (marty) {
  marty.register('createConstants', createConstants);

  function createConstants(obj) {
    return constants(obj);
  }
};
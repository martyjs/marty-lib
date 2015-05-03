var Marty = require('../../core/marty');

module.exports = function () {
  var marty = new Marty();

  marty.use(require('../index'));
  marty.use(require('../../core'));

  return marty;
};
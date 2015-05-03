var Marty = require('../../core/lib/marty');

module.exports = function () {
  var marty = new Marty();

  marty.use(require('../index'));
  marty.use(require('marty-core'));

  return marty;
};
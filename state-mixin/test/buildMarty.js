var Marty = require('../../core/lib/marty');

module.exports = function () {
  var marty = new Marty('vTest', require('react'));

  marty.use(require('../index'));
  marty.use(require('marty-core'));
  marty.use(require('marty-store'));

  return marty;
};
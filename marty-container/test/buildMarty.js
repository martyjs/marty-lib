var Marty = require('marty-core').Marty;

module.exports = function () {
  var marty = new Marty('vTest', require('react'));

  marty.use(require('../main'));
  marty.use(require('marty-core'));
  marty.use(require('marty-store'));

  return marty;
};
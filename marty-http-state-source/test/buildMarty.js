var Marty = require('marty-core').Marty;

module.exports = function () {
  var marty = new Marty();

  marty.use(require('../main'));
  marty.use(require('marty-core'));

  return marty;
};
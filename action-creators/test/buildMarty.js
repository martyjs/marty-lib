var Marty = require('../../core').Marty;

module.exports = function () {
  var marty = new Marty();

  marty.use(require('../index'));
  marty.use(require('marty-core'));
  marty.use(require('marty-isomorphism'));

  return marty;
};
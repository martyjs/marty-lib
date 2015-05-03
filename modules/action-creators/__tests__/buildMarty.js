var Marty = require('../../core/marty');

module.exports = function () {
  var marty = new Marty('vNext', require('react'));

  marty.use(require('../index'));
  marty.use(require('../../core'));
  marty.use(require('../../isomorphism'));
  marty.use(require('../../application'));

  marty.warnings.appIsTheFuture = false;

  return marty;
};
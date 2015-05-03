var Marty = require('../../core/marty');

module.exports = function () {
  var marty = new Marty('vNext', require('react'));

  marty.use(require('../index'));
  marty.use(require('../../core'));
  marty.use(require('../../application'));
  marty.use(require('../../isomorphism'));

  marty.warnings.appIsTheFuture = false;

  return marty;
};
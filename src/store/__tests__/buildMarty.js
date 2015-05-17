var Marty = require('../../core/marty');

module.exports = function () {
  var marty = new Marty('vNext', require('react'));

  marty.use(require('../index'));
  marty.use(require('../../core'));
  marty.use(require('../../application'));
  marty.use(require('../../action-creators'));

  marty.warnings.appIsTheFuture = false;

  return marty;
};
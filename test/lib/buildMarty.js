var Marty = require('../../src/core/marty');

module.exports = function () {
  var marty = new Marty('vNext', require('react'));

  marty.use(require('../../src/core'));
  marty.use(require('../../src/action-creators'));
  marty.use(require('../../src/application'));
  marty.use(require('../../src/constants'));
  marty.use(require('../../src/container'));
  marty.use(require('../../src/cookie-state-source'));
  marty.use(require('../../src/http-state-source'));
  marty.use(require('../../src/isomorphism'));
  marty.use(require('../../src/json-storage-state-source'));
  marty.use(require('../../src/local-storage-state-source'));
  marty.use(require('../../src/location-state-source'));
  marty.use(require('../../src/queries'));
  marty.use(require('../../src/session-storage-state-source'));
  marty.use(require('../../src/state-mixin'));
  marty.use(require('../../src/store'));

  marty.warnings.appIsTheFuture = false;

  return marty;
};
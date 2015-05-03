var Marty = require('../../core/lib/marty');

module.exports = function () {
  var marty = new Marty('vTest', require('react'));

  marty.use(require('../index'));
  marty.use(require('marty-core'));
  marty.use(require('marty-store'));
  marty.use(require('marty-container'));
  marty.use(require('marty-state-mixin'));
  marty.use(require('marty-action-creators'));

  return marty;
};
var Marty = require('../../core/marty');

module.exports = function () {
  var marty = new Marty('vTest', require('react'));

  marty.use(require('../index'));
  marty.use(require('../../core'));
  marty.use(require('../../store'));
  marty.use(require('../../container'));
  marty.use(require('../../state-mixin'));
  marty.use(require('../../application'));
  marty.use(require('../../action-creators'));

  return marty;
};
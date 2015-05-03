var Marty = require('../marty');
var TestSource = require('./fixtures/testSource');

module.exports = function () {
  var marty = new Marty('vNext', require('react'));

  marty.use(require('../index'));
  marty.use(require('../../store'));
  marty.use(require('../../application'));
  marty.use(function (marty) {
    marty.registerStateSource('TestSource', 'testSource', TestSource);
  });

  return marty;
};
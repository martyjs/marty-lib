var Marty = require('../marty');
var TestSource = require('./fixtures/testSource');

module.exports = function () {
  var marty = new Marty();

  marty.use(require('../index'));
  marty.use(function (marty) {
    marty.registerStateSource('TestSource', 'testSource', TestSource);
  });

  return marty;
};
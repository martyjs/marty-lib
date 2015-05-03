let HttpStateSource = require('./http');

module.exports = function (marty) {
  marty.registerStateSource(
    'HttpStateSource',
    'http',
    HttpStateSource
  );
};
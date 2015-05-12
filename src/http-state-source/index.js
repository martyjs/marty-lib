let HttpStateSource = require('./http');
let registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(
    marty,
    'HttpStateSource',
    'http',
    HttpStateSource
  );

  marty.hooks = require('./hooks');
};
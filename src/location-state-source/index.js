let LocationStateSource = require('./location');
let registerStateSource = require('../core/registerStateSource');

module.exports = function (marty) {
  registerStateSource(
    marty,
    'LocationStateSource',
    'location',
    LocationStateSource
  );
};
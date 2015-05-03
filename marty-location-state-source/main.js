var LocationStateSource = require('./lib/location');

module.exports = function (marty) {
  marty.registerStateSource(
    'LocationStateSource',
    'location',
    LocationStateSource
  );
};
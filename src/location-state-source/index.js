let LocationStateSource = require('./location');

module.exports = function (marty) {
  marty.registerStateSource(
    'LocationStateSource',
    'location',
    LocationStateSource
  );
};
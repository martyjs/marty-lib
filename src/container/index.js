const _ = require('../mindash');

module.exports = function (marty, React) {
  _.extend(marty, require('./createContainer')(React));
};

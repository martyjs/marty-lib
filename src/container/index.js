module.exports = function (marty, React) {
  marty.createContainer = require('./createContainer')(React);
};
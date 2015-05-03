module.exports = function (marty, React) {
  marty.register('createContainer', require('./lib/createContainer')(React));
};
module.exports = function (marty, React) {
  marty.register('createStateMixin', require('./createStateMixin')(React));
};
module.exports = function (marty, React) {
  var Application = require('./application')(React);

  marty.register('createApplication', require('./createApplication')(Application));
  marty.register('Application', Application);
  marty.register('contextTypes', {
    app: React.PropTypes.instanceOf(Application)
  });
};
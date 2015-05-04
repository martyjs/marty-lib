module.exports = function (marty, React) {
  let Application = require('./application')(React);

  marty.register('createApplication', require('./createApplication')(Application));
  marty.register('Application', Application);
  marty.register('contextTypes', {
    app: React.PropTypes.instanceOf(Application)
  });
};
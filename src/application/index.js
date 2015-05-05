module.exports = function (marty, React) {
  let Application = require('./application')(React);

  marty.createApplication = require('./createApplication')(Application);
  marty.Application = Application;
  marty.contextTypes = {
    app: React.PropTypes.instanceOf(Application)
  };
};
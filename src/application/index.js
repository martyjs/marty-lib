module.exports = function (marty, React) {
  let Application = require('./application')(React);
  let ApplicationContainer = require('./applicationContainer')(React);

  marty.createApplication = require('./createApplication')(Application);
  marty.Application = Application;
  marty.ApplicationContainer = ApplicationContainer;
  marty.contextTypes = {
    app: React.PropTypes.instanceOf(Application)
  };
};
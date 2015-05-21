'use strict';

module.exports = function (marty, React) {
  var Application = require('./application')(React);
  var ApplicationContainer = require('./applicationContainer')(React);

  marty.createApplication = require('./createApplication')(Application);
  marty.Application = Application;
  marty.ApplicationContainer = ApplicationContainer;
  marty.contextTypes = {
    app: React.PropTypes.instanceOf(Application)
  };
};
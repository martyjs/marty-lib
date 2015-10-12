module.exports = function (marty, React, ReactDOMServer) {
  let Application = require('./application')(React, ReactDOMServer);

  marty.ApplicationContainer = require('./applicationContainer')(React);
  marty.createApplication = require('./createApplication')(Application);
  marty.Application = Application;
  marty.contextTypes = {
    app: React.PropTypes.instanceOf(Application)
  };
};

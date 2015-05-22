var invariant = require('invariant');
var { renderIntoDocument } = require('react/addons').addons.TestUtils;
var ApplicationContainer = require('../application/applicationContainer');

function renderIntoDocument(element, app) {
  invariant(element, 'Must specify ReactElement');
  invariant(app, 'Must specify Marty application');

  return renderIntoDocument(<ApplicationContainer app={app}>{element}</ApplicationContainer>);
}

module.exports = renderIntoDocument;
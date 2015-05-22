'use strict';

var invariant = require('invariant');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

var ApplicationContainer = require('../application/applicationContainer');

function renderIntoDocument(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var element = _x,
        app = _x2;
    _again = false;

    invariant(element, 'Must specify ReactElement');
    invariant(app, 'Must specify Marty application');

    _x = React.createElement(
      ApplicationContainer,
      { app: app },
      element
    );
    _again = true;
    continue _function;
  }
}

module.exports = renderIntoDocument;
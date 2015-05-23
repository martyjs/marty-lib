'use strict';

var _ = require('../mindash');
var MAX_NUMBER_OF_ITERATIONS = 10;
var invariant = require('invariant');

function renderToString(app, render, createElement, options) {
  options = _.defaults(options || {}, {
    maxNumberOfIterations: MAX_NUMBER_OF_ITERATIONS
  });

  invariant(app, 'Must specify the application');
  invariant(render, 'Must specify the render function');
  invariant(_.isFunction(createElement), 'Must specify the element factory');

  var totalIterations = 0;
  var fetchOptions = { timeout: options.timeout };

  return new Promise(function (resolve, reject) {
    var element = createElement();

    resolveFetches().then(dehydrateAndRenderHtml);

    function dehydrateAndRenderHtml(diagnostics) {
      app.fetch(function () {
        try {
          var html = render(element);
          html += dehydratedState();
          resolve({
            html: html,
            diagnostics: diagnostics.toJSON()
          });
        } catch (e) {
          reject(e);
        }
      }, fetchOptions);
    }

    // Repeatedly re-render the component tree until
    // we no longer make any new fetches
    function resolveFetches(prevDiagnostics) {
      return waitForFetches(prevDiagnostics).then(function (diagnostics) {
        if (diagnostics.numberOfNewFetchesMade === 0) {
          return diagnostics;
        }

        if (totalIterations > options.maxNumberOfIterations) {
          return diagnostics;
        }

        totalIterations++;
        return resolveFetches(diagnostics);
      });
    }

    function waitForFetches(prevDiagnostics) {
      var options = _.extend({
        prevDiagnostics: prevDiagnostics
      }, fetchOptions);

      return app.fetch(function () {
        try {
          render(element);
        } catch (e) {
          reject(e);
        }
      }, options);
    }

    function dehydratedState() {
      return '<script id="__marty-state">' + app.dehydrate() + '</script>';
    }
  });
}

module.exports = renderToString;
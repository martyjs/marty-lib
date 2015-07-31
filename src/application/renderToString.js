let _ = require('../mindash');
let escapeHtml = require('escape-html');
let invariant = require('invariant');

let MAX_NUMBER_OF_ITERATIONS = 10;

let STATE_ID = '__marty-state';
let STATE_ATTR = 'data-state';

function renderToString(app, render, createElement, options) {
  options = _.defaults(options || {}, {
    maxNumberOfIterations: MAX_NUMBER_OF_ITERATIONS
  });

  invariant(app, 'Must specify the application');
  invariant(render, 'Must specify the render function');
  invariant(_.isFunction(createElement), 'Must specify the element factory');

  let totalIterations = 0;
  let fetchOptions = { timeout: options.timeout };

  return new Promise(function (resolve, reject) {
    let element = createElement();

    resolveFetches().then(dehydrateAndRenderHtml);

    function dehydrateAndRenderHtml(diagnostics) {
      app.fetch(function () {
        try {
          let htmlBody = render(element);
          let htmlState = dehydratedState();
          resolve({
            diagnostics: diagnostics.toJSON(),
            html: htmlBody + htmlState,
            htmlBody: htmlBody,
            htmlState: htmlState
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
      let options = _.extend({
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
      const state = escapeHtml(JSON.stringify(app.dehydrate()));
      return `<script id="${STATE_ID}" ${STATE_ATTR}="${state}"></script>`;
    }
  });
}

renderToString.stateId = STATE_ID;
renderToString.stateAttr = STATE_ATTR;

module.exports = renderToString;

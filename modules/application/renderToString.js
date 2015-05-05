"use strict";

function renderToString(app, render, element, options) {
  options = options || {};

  var fetchOptions = { timeout: options.timeout };

  return new Promise(function (resolve, reject) {
    startFetches().then(dehydrateAndRenderHtml);

    function dehydrateAndRenderHtml(diagnostics) {
      app.fetch(function () {
        try {
          var html = render(element);
          html += dehydratedState();
          resolve({
            html: html,
            diagnostics: diagnostics
          });
        } catch (e) {
          reject(e);
        }
      }, fetchOptions);
    }

    function startFetches() {
      return app.fetch(function () {
        try {
          render(element);
        } catch (e) {
          reject(e);
        }
      }, fetchOptions);
    }

    function dehydratedState() {
      return "<script id=\"__marty-state\">" + app.dehydrate() + "</script>";
    }
  });
}

module.exports = renderToString;
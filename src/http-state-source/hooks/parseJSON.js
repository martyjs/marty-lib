let _ = require('../../mindash');
let log = require('../../core/logger');
let warnings = require('../../core/warnings');

let CONTENT_TYPE = 'Content-Type';
let JSON_CONTENT_TYPE = 'application/json';

module.exports = {
  id: 'parseJSON',
  after: function (res) {
    if (isJson(res)) {
      if (warnings.parseJSONDeprecated) {
        log.warn(
          'Warning: The parseJSON HTTP hook is being deprecated ' +
          'http://martyjs.org/guides/upgrading/09_10.html#parseJSON'
        );
      }

      return res.json().then(function (body) {
        try {
          res.body = body;
        } catch (e) {
          if (e instanceof TypeError) {
            // Workaround for Chrome 43+ where Response.body is not settable.
            Object.defineProperty(res, 'body', {value: body});
          } else {
            throw e;
          }
        }

        return res;
      });
    }

    return res;
  }
};

function isJson(res) {
  let contentTypes = res.headers.get(CONTENT_TYPE);

  if (!_.isArray(contentTypes)) {
    if (contentTypes === undefined || contentTypes === null) {
      contentTypes = [];
    } else {
      contentTypes = [contentTypes];
    }
  }

  return _.any(contentTypes, function (contentType) {
    return contentType.indexOf(JSON_CONTENT_TYPE) !== -1;
  });
}

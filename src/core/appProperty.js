let findApp = require('./findApp');

function appProperty(obj) {
  if (!obj.hasOwnProperty('app')) {
    Object.defineProperty(obj, 'app', {
      get: function () {
        return findApp(this);
      },
      set: function () {
        // Do nothing until https://github.com/gaearon/react-hot-api/pull/16 is resolves
      }
    });
  }
}

module.exports = appProperty;
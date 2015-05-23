let findApp = require('./findApp');

function appProperty(obj) {
  if (!obj.hasOwnProperty('app')) {
    Object.defineProperty(obj, 'app', {
      get: function () {
        return findApp(this);
      }
    });
  }
}

module.exports = appProperty;
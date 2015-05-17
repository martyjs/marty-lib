let { toArray, extend } = require('../mindash');

function handles() {
  let constants = toArray(arguments);

  return function (target, name, descriptor) {
    target.handlers = extend({}, target.handlers, {
      [name]: constants
    });

    return descriptor;
  };
}

module.exports = handles;
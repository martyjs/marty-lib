"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;
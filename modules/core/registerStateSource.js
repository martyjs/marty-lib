"use strict";

function registerStateSource(marty, id, stateSourceId, clazz) {
  marty[id] = clazz;
  marty.stateSources[stateSourceId] = clazz;
}

module.exports = registerStateSource;
'use strict';

var Queries = require('./queries');
var createQueriesClass = require('./createQueriesClass');

module.exports = function (marty) {
  marty.registerClass('Queries', Queries);
  marty.register('createQueries', createQueries);

  function createQueries(properties) {
    var QueriesClass = createQueriesClass(properties);
    var defaultInstance = this.register(QueriesClass);

    return defaultInstance;
  }
};
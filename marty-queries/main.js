var Queries = require('./lib/queries');
var createQueriesClass = require('./lib/createQueriesClass');

module.exports = function (marty) {
  marty.registerClass('Queries', Queries);
  marty.register('createQueries', createQueries);

  function createQueries(properties) {
    var QueriesClass = createQueriesClass(properties);
    var defaultInstance = this.register(QueriesClass);

    return defaultInstance;
  }
};
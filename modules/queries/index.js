let Queries = require('./queries');
let createQueriesClass = require('./createQueriesClass');

module.exports = function (marty) {
  marty.registerClass('Queries', Queries);
  marty.register('createQueries', createQueries);

  function createQueries(properties) {
    let QueriesClass = createQueriesClass(properties);
    let defaultInstance = this.register(QueriesClass);

    return defaultInstance;
  }
};
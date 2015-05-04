let Queries = require('./queries');

module.exports = function (marty) {
  marty.registerClass('Queries', Queries);
  marty.register('createQueries', require('./createQueriesClass'));
};
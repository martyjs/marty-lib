'use strict';

var _ = require('../mindash');
var StatusConstants = require('./fetchConstants');

when.all = all;
when.join = join;

function when(handlers, parentContext) {
  handlers || (handlers = {});

  var handler = handlers[this.status.toLowerCase()];

  if (!handler) {
    throw new Error('Could not find a ' + this.status + ' handler');
  }

  if (parentContext) {
    WhenContext.prototype = parentContext;
  }

  switch (this.status) {
    case StatusConstants.PENDING:
      return handler.call(new WhenContext());
    case StatusConstants.FAILED:
      return handler.call(new WhenContext(), this.error);
    case StatusConstants.DONE:
      return handler.call(new WhenContext(), this.result);
    default:
      throw new Error('Unknown fetch result status');
  }

  function WhenContext() {
    _.extend(this, handlers);
  }
}

function join() /* fetchResults, handlers */{
  var parentContext = undefined;
  var handlers = _.last(arguments);
  var fetchResults = _.initial(arguments);

  if (!areHandlers(handlers) && areHandlers(_.last(fetchResults))) {
    parentContext = handlers;
    handlers = fetchResults.pop();
  }

  return all(fetchResults, handlers, parentContext);
}

function all(fetchResults, handlers, parentContext) {
  if (!fetchResults || !handlers) {
    throw new Error('No fetch results or handlers specified');
  }

  if (!_.isArray(fetchResults) || _.any(fetchResults, notFetchResult)) {
    throw new Error('Must specify a set of fetch results');
  }

  var context = {
    result: results(fetchResults),
    error: firstError(fetchResults),
    status: aggregateStatus(fetchResults)
  };

  return when.call(context, handlers, parentContext);
}

function areHandlers(obj) {
  return _.isFunction(obj.done);
}

function results(fetchResults) {
  return fetchResults.map(function (result) {
    return result.result;
  });
}

function firstError(fetchResults) {
  var failedResult = _.find(fetchResults, {
    status: StatusConstants.FAILED
  });

  if (failedResult) {
    return failedResult.error;
  }
}

function notFetchResult(result) {
  return !result._isFetchResult;
}

function aggregateStatus(fetchResults) {
  for (var i = fetchResults.length - 1; i >= 0; i--) {
    var _status = fetchResults[i].status;

    if (_status === StatusConstants.FAILED || _status === StatusConstants.PENDING) {
      return _status;
    }
  }

  return StatusConstants.DONE;
}

module.exports = when;
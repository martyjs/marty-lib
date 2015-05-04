let log = require('../core/logger');
let _ = require('../mindash');
let fetch = require('../store/fetch');

function getFetchResult(component) {
  let errors = {};
  let results = {};
  let isPending = false;
  let hasFailed = false;
  let fetches = invokeFetches(component);

  _.each(fetches, (fetch, key) => {
    if (fetch.done) {
      results[key] = fetch.result;
    } else if (fetch.pending) {
      isPending = true;
    } else if (fetch.failed) {
      hasFailed = true;
      errors[key] = fetch.error;
    }
  });

  if (hasFailed) {
    return fetch.failed(errors);
  }

  if (isPending) {
    return fetch.pending();
  }

  return fetch.done(results);
}

function invokeFetches(component) {
  let fetches = {};

  if (_.isFunction(component.fetch)) {
    let result = component.fetch.call(component);

    if (result._isFetchResult) {
      throw new Error(
        'Cannot return a single fetch result. You must return an object ' +
        'literal where the keys map to props and the values can be fetch results'
      );
    }

    _.each(result, (result, key) => {
      if (!result || !result._isFetchResult) {
        result = fetch.done(result);
      }

      fetches[key] = result;
    });
  } else {
    _.each(component.fetch, (getResult, key) => {
      if (!_.isFunction(getResult)) {
        log.warn(`The fetch ${key} was not a function and so ignoring`);
      } else {
        let result = getResult.call(component);

        if (!result || !result._isFetchResult) {
          result = fetch.done(result);
        }

        fetches[key] = result;
      }
    });
  }

  return fetches;
}

module.exports = getFetchResult;
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('../mindash');

var FetchDiagnostics = (function () {
  function FetchDiagnostics(prevDiagnostics) {
    _classCallCheck(this, FetchDiagnostics);

    prevDiagnostics = prevDiagnostics || {
      fetches: [],
      numberOfPendingFetches: 0
    };

    this.numberOfNewFetchesMade = 0;
    this.fetches = prevDiagnostics.fetches;
    this.numberOfPendingFetches = prevDiagnostics.numberOfPendingFetches;
  }

  _createClass(FetchDiagnostics, [{
    key: 'fetchStarted',
    value: function fetchStarted(storeId, fetchId) {
      var fetch = this.getFetch(storeId, fetchId);

      if (!fetch) {
        this.numberOfNewFetchesMade++;
      }

      this.numberOfPendingFetches++;
      this.fetches.push({
        status: 'PENDING',
        storeId: storeId,
        fetchId: fetchId,
        startTime: new Date()
      });
    }
  }, {
    key: 'fetchFinished',
    value: function fetchFinished(storeId, fetchId, status, options) {
      var fetch = this.getFetch(storeId, fetchId);

      if (fetch) {
        _.extend(fetch, {
          status: status,
          time: new Date() - fetch.startTime
        }, options);

        this.numberOfPendingFetches--;
      }
    }
  }, {
    key: 'getFetch',
    value: function getFetch(storeId, fetchId) {
      return _.find(this.fetches, {
        storeId: storeId,
        fetchId: fetchId
      });
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return _.map(this.fetches, fetchWithTime);

      function fetchWithTime(fetch) {
        if (_.isUndefined(fetch.time)) {
          fetch.time = new Date() - fetch.startTime;
        }

        delete fetch.startTime;

        return fetch;
      }
    }
  }, {
    key: 'hasPendingFetches',
    get: function get() {
      return this.numberOfPendingFetches > 0;
    }
  }]);

  return FetchDiagnostics;
})();

module.exports = FetchDiagnostics;
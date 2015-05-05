'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var StateSource = require('../../stateSource');

var TestSource = (function (_StateSource) {
  function TestSource() {
    _classCallCheck(this, TestSource);

    if (_StateSource != null) {
      _StateSource.apply(this, arguments);
    }
  }

  _inherits(TestSource, _StateSource);

  return TestSource;
})(StateSource);

module.exports = TestSource;
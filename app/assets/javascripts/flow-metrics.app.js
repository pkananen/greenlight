//= require flow-metrics/board/board.module
//= require flow-metrics/flow/flow.module
//= require flow-metrics/services/services.module
//= require_self

(function() {
  'use strict';

  angular
    .module('flowMetrics', [
      'angularMoment',
      'flowMetrics.board',
      'flowMetrics.services',
      'flowMetrics.flow'
    ]);
})();

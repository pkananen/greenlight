(function() {
    'use strict';

    angular
    .module('flowMetrics.services')
    .factory('FlowDataFactory', FlowDataFactory);

    function FlowDataFactory() {
      return {
        getColumns: getColumns,
        getItems: getItems
      };

      function getColumns() {
        return [
          {name: 'Backlog', id: 1, start: true, end: false, idle: true, wipLimit: 99},
          {name: 'Rqmts', id: 2, start: false, end: false, idle: false, wipLimit: 1},
          {name: 'RF Desgn', id: 3, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'Design', id: 4, start: false, end: false, idle: false, wipLimit: 1},
          {name: 'RF Dev', id: 5, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'Dev', id: 6, start: false, end: false, idle: false, wipLimit: 1},
          {name: 'RF QA', id: 7, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'QA', id: 8, start: false, end: false, idle: false, wipLimit: 1},
          {name: 'RF Ops', id: 9, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'Ops', id: 10, start: false, end: false, idle: false, wipLimit: 1},
          {name: 'Done', id: 11, start: false, end: true, idle: true, wipLimit: 99}
        ];
      }

      function getItems() {
        return [
          {name: "W101", id: 1, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W102", id: 2, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W103", id: 3, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W104", id: 4, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W105", id: 5, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W106", id: 6, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W107", id: 7, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W108", id: 8, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W109", id: 9, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W110", id: 10, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W111", id: 11, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W112", id: 12, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W113", id: 13, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W114", id: 14, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W115", id: 15, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W116", id: 16, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W117", id: 17, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W118", id: 18, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W119", id: 19, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
          {name: "W120", id: 20, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
        ];
      }
    }
})();

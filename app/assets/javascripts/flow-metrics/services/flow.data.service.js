(function() {
    'use strict';

    angular
    .module('flowMetrics.services')
    .factory('FlowDataFactory', FlowDataFactory);

    function FlowDataFactory() {
      return {
        getColumns: getColumns,
        getBatches: getBatches,
        getItems: getItems,
        getWorkers: getWorkers
      };

      function getWorkers() {
        return [
          {name: 'Rq1', id: 1, columnId: 2, itemId: undefined},
          {name: 'Ds1', id: 2, columnId: 4, itemId: undefined},
          {name: 'Dv1', id: 3, columnId: 6, itemId: undefined},
          {name: 'Dv2', id: 4, columnId: 6, itemId: undefined},
          {name: 'Qa1', id: 5, columnId: 8, itemId: undefined},
          {name: 'Op1', id: 6, columnId: 10, itemId: undefined}
        ];
      }

      function getColumns() {
        return [
          {name: 'Backlog', id: 1, start: true, end: false, idle: true, wipLimit: 99},
          {name: 'Rqmts', id: 2, start: false, end: false, idle: false, wipLimit: 2},
          {name: 'RF Desgn', id: 3, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'Design', id: 4, start: false, end: false, idle: false, wipLimit: 2},
          {name: 'RF Dev', id: 5, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'Dev', id: 6, start: false, end: false, idle: false, wipLimit: 2},
          {name: 'RF QA', id: 7, start: false, end: false, idle: true, wipLimit: 6},
          {name: 'QA', id: 8, start: false, end: false, idle: false, wipLimit: 2},
          {name: 'RF Ops', id: 9, start: false, end: false, idle: true, wipLimit: 5},
          {name: 'Ops', id: 10, start: false, end: false, idle: false, wipLimit: 2},
          {name: 'Done', id: 11, start: false, end: true, idle: true, wipLimit: 99}
        ];
      }

      function getBatches() {
        return [
          {name: "Batch 1", id: 1, dependentOn: [2], columns: [7]},
          {name: "Batch 2", id: 2, columns: [5]},
          {name: "Batch 3", id: 3, dependentOn: [2], columns: [5, 9]},
          {name: "Batch 4", id: 4, dependentOn: [1], columns: [7]},
          {name: "Batch 5", id: 5, dependentOn: [3], columns: [3]}
        ];
      }

      function getItems() {
        return [
          {name: "W101", id: 1, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 2, value: 100},
          {name: "W102", id: 2, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, value: 100},
          {name: "W103", id: 3, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, value: 50},
          {name: "W104", id: 4, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 2, value: 100},
          {name: "W105", id: 5, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 2, value: 0},
          {name: "W106", id: 6, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 2, value: 0},
          {name: "W107", id: 7, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, value: 50},
          {name: "W108", id: 8, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 1, value: 0},
          {name: "W109", id: 9, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 1, value: 300},
          {name: "W110", id: 10, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 1, value: 0},
          {name: "W111", id: 11, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 1, value: 40},
          {name: "W112", id: 12, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 5, value: 0},
          {name: "W113", id: 13, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, value: 20},
          {name: "W114", id: 14, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 4, value: 0},
          {name: "W115", id: 15, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, value: 30},
          {name: "W116", id: 16, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 4, value: 0},
          {name: "W117", id: 17, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 3, value: 50},
          {name: "W118", id: 18, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 3, value: 0},
          {name: "W119", id: 19, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 3, value: 40},
          {name: "W120", id: 20, columnId: 1, workerId: undefined, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 1, batchId: 3, value: 0},
        ];
      }
    }
})();

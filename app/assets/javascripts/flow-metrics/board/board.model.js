(function() {
  'use strict';

  angular
    .module('flowMetrics.board')
    .factory('FlowBoard', FlowBoard);

  function FlowBoard(FlowDataFactory) {

    var board = this;
    board.dataService = FlowDataFactory;
    board.columns = board.dataService.getColumns();
    board.items = board.dataService.getItems();
    board.batches = board.dataService.getBatches();
    board.workers = board.dataService.getWorkers();

    return {
      columns: board.columns,
      columnById: columnById,
      workerById: workerById,
      columnNames: columnNames,
      workColumns: workColumns,
      queueColumns: queueColumns,
      idleColumns: idleColumns,
      items: board.items,
      itemsInColumn: itemsInColumn,
      activeItems: activeItems,
      itemsRemainingForColumn: itemsRemainingForColumn,
      itemsInBatch: itemsInBatch,
      batchSatisfied: batchSatisfied,
      batchesForColumnId: batchesForColumnId,
      valueForBatch: valueForBatch,
      batchById: batchById,
      resetItems: resetItems,
      resetWorkers: resetWorkers,
      workers: board.workers,
      allWorkers: allWorkers,
      workersForColumn: workersForColumn,
      itemsForWorker: itemsForWorker,
      nextWorkerForColumn: nextWorkerForColumn
    }

    function allWorkers() {
      return _.flatten(_.values(board.workers));
    }

    function resetItems() {
      _.each(board.items, function(itm) {
        itm.columnId = 1;
        itm.timestamp = 0;
        itm.times = {active: 0, idle: 0};
        itm.workRemaining = _.sample([5, 7, 11, 17]);
      });
    }

    function resetWorkers() {
      _.each(allWorkers(), function(wrkr) {
        wrkr.timestamp = 0;
        wrkr.times = {active: 0, idle: 0};
      });
    }

    function itemsInColumn(column) {
      let items =  _.filter(board.items, function(itm) {
        return itm.columnId === column.id;
      });
      return items;
    }

    function workersForColumn(column) {
      return board.workers[column.id];
    }

    function itemsForWorker(worker) {
      let itms = _.filter(board.items, function(itm) {
        return worker.id === itm.workerId;
      });
      return itms;
    }

    function nextWorkerForColumn(column) {
      let wrkrs = _.sortBy(workersForColumn(column), function(wrkr) { return wrkr.id; });
      return _.find(wrkrs, function(wrkr) {
        return wrkr.itemId == undefined;
      });
    }

    function queueColumns() {
      let qs = _.filter(board.columns, function(col) {
        return col.idle && !col.start && !col.end;
      });
      return qs;
    };

    function itemsInBatch(batchId) {
      let items = _.filter(board.items, function(itm) {
        return itm.batchId === batchId;
      });
      return items;
    }

    function valueForBatch(batchId) {
      return _.sumBy(itemsInBatch(batchId), function(itm) { return itm.value; });
    }

    function batchSatisfied(batch, colId) {
      if (colId == undefined) {
        colId = _.max(batch.columns);
      }
      let lowestItemCol = _.min(_.map(itemsInBatch(batch.id), 'columnId'));
      if (lowestItemCol  < colId) {
        return false;
      }
      _.each(dependentBatchesForBatch(batch), function(depBch) {
        if (!batchSatisfied(depBch, colId)) {
          return false;
        }
      });
      return true;
    }

    function batchesForColumnId(colId) {
      return _.find(board.batches, function(bch) {
        return _.includes(bch.columns, colId);
      });
    }

    function dependentBatchesForBatch(batch) {
      return _.find(board.batches, function(bch) {
        return _.includes(board.dependent, bch.id);
      });
    }

    function batchById(batchId) {
      return _.find(board.batches, function(bch) {
        return bch.id == batchId;
      });
    }

    function workerById(workerId) {
      return _.find(allWorkers(), function(wrkr) {
        return wrkr.id === workerId;
      });
    }

    function idleColumns() {
      return _.filter(board.columns, function(col) {
        return col.idle;
      });
    };

    function workColumns() {
      return _.filter(board.columns, function(col) {
        return !col.idle;
      });
    };

    function activeItems() {
      return _.filter(board.items, function(item) {
        let column = board.columnById(item.columnId);
        return !column.idle;
      });
    };

    function columnById(colId) {
      return _.find(board.columns, function(col) {
        return col.id == colId;
      });
    };

    function columnNames(colIds) {
      return _.map(colIds, function(colId) {
        return columnById(colId).name;
      });
    }

    function itemsRemainingForColumn(column) {
      let columns = _.filter(board.columns, function(col) {
        return col.id <= column.id;
      });
      let items = _.reduce(columns, function(memo, col) { return memo + itemsInColumn(col); }, []);
      return items;
    }

  }
})();

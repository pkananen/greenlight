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

    return {
      columns: board.columns,
      columnById: columnById,
      workColumns: workColumns,
      queueColumns: queueColumns,
      idleColumns: idleColumns,
      columnUnderWipLimit: columnUnderWipLimit,
      items: board.items,
      itemsInColumn: itemsInColumn,
      activeItems: activeItems,
      itemsRemainingForColumn: itemsRemainingForColumn
    }

    function itemsInColumn(column) {
      let items =  _.filter(board.items, function(itm) {
        return itm.columnId == column.id;
      });
      return items;
    }

    function queueColumns() {
      let qs = _.filter(board.columns, function(col) {
        return col.idle && !col.start && !col.end;
      });
      return qs;
    };

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

    function columnById(col_id) {
      return _.find(board.columns, function(col) {
        return col.id == col_id;
      });
    };

    function itemsRemainingForColumn(column) {
      let columns = _.filter(board.columns, function(col) {
        return col.id <= column.id;
      });
      let items = _.reduce(columns, function(memo, col) { return memo + itemsInColumn(col); }, []);
      return items;
    }

    function columnUnderWipLimit(column) {
      return (itemsInColumn(column)).length < column.wipLimit;
    };
  }
})();

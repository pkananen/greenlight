angular.module('flowMetrics.flow', [])
  .controller('FlowController', function($scope, $interval, FlowBoard) {
    var flow = this;
    flow.board = FlowBoard;

    flow.historicalTimes = [];
    flow.historicalQueues = [];
    flow.historicalWip = [];
    flow.valueTimes = [];
    flow.done = false;
    flow.running = false;
    flow.maxItemProgress = 1;
    flow.minItemProgress = 1;
    flow.timer = undefined;

    flow.workSizeOptions = {'Uniform (4)': 0, 'Low (1)': 1, 'High (5-17)': 2};

    flow.workSizes = {0: [4], 1: [1], 2: [5, 7, 11, 17]};
    flow.workVariability = 1;

    flow.productivitySizeOptions = {'Uniform (4)': 0, 'Low (1)': 1, 'High (5-17)': 2};
    flow.workerProductivity = {2: 1, 4: 1, 6: 1, 8: 1, 10: 1};
    flow.productivitySizes = {0: [4], 1: [1], 2: [5, 7, 11, 17]};
    flow.productivityVariability = 1;

    flow.queueSizes = {3: [], 5: [], 7: [], 9: []};
    flow.wipSizes = {2: [], 4: [], 6: [], 8: [], 10: []};

    flow.resetBoard = function() {
      if (flow.running) { return; };
      if (flow.done) {
        flow.historicalTimes.push([
          flow.totalActiveTime(),
          flow.totalIdleTime(),
          flow.totalTime(),
          flow.totalIdleTimePercentage()]);
        flow.historicalQueues.push([
          flow.averageQueueSize(flow.board.columnById(3)),
          flow.averageQueueSize(flow.board.columnById(5)),
          flow.averageQueueSize(flow.board.columnById(7)),
          flow.averageQueueSize(flow.board.columnById(9))]);
        flow.historicalWip.push([
          flow.averageWipSize(flow.board.columnById(2)),
          flow.averageWipSize(flow.board.columnById(4)),
          flow.averageWipSize(flow.board.columnById(6)),
          flow.averageWipSize(flow.board.columnById(8)),
          flow.averageWipSize(flow.board.columnById(10))]);
      }
      else {
        $interval.cancel(flow.timer);
      }
      flow.board.resetItems();
      flow.queueSizes = {3: [], 5: [], 7: [], 9: []};
      flow.wipSizes = {2: [], 4: [], 6: [], 8: [], 10: []};
      flow.maxItemProgress = 1;
      flow.minItemProgress = 1;
      flow.valueTimes = [];
      flow.done = false;
      flow.running = false;
    };

    flow.play = function() {
      flow.running = true;
      flow.timer = $interval(flow.tickBoard, 800);
    };

    flow.valueDelivered = function() {
      let value = _.sum(_.map(flow.valueTimes, function(v) { return v.value; }));
      return value;
    }

    flow.pause = function() {
      flow.running = false;
      $interval.cancel(flow.timer);
    }

    flow.tickBoard = function() {
      if (flow.board.itemsInColumn(flow.board.columnById('11')).length == flow.board.items.length) {
        $interval.cancel(flow.timer);
        flow.done = true;
        flow.running = false;
        console.log("Done!");
      }
      else {
        flow.recordQueueSizes();
        flow.recordWipSizes();
        flow.tickWorkers();
      }
    };

    flow.tickWorkers = function() {
      let walkTheBoard = _.shuffle(flow.board.workColumns());
      _.each(walkTheBoard, function(workColumn) {
        console.log("ticking column " + workColumn.name);
        let workItem = _.first(_.sortBy(flow.board.itemsInColumn(workColumn), 'id'));
        if (workItem) {
          console.log("working...");
          flow.doWork(workColumn, workItem);
          if (workItem.workRemaining == 0) {
            console.log("...done!");
            flow.moveItem(workItem);
          }
          else {
            console.log("...not done!");
          }
        }
        if (workColumn.id > 1) {
          while (flow.board.columnUnderWipLimit(workColumn)) {

            let pullColumn = flow.board.columnById(workColumn.id - 1);
            let itemToPull = _.first(flow.board.itemsInColumn(pullColumn));
            if (itemToPull) {
              let itemBatch = flow.board.batchById(itemToPull.batchId);
              // make sure the batch applies to this column
              if (itemBatch && _.includes(itemBatch.columns, pullColumn.id)) {
                let batchesSatisfied = flow.board.batchSatisfied(itemBatch, pullColumn.id);
                if (batchesSatisfied) {
                  console.log("batches for " + itemToPull.name + " are satisfied - " + batchesSatisfied);
                  console.log(workColumn.name + " trying to pull " + itemToPull.name + " from " + pullColumn.name + "...");
                  flow.moveItem(itemToPull);
                }
                else {
                  console.log("batches for " + itemToPull.name + " are satisfied - " + batchesSatisfied);
                  break;
                }
              }
              else {
                console.log("no batches for " + itemToPull.name);
                console.log(workColumn.name + " trying to pull " + itemToPull.name + " from " + pullColumn.name + "...");
                flow.moveItem(itemToPull);
              }
            }
            else {
              break;
            }
          }
        }
      });
    };

    flow.doWork = function(column, item) {
      let productivity = _.sample(flow.productivitySizes[flow.workerProductivity[column.id]]);
      console.log(item.workRemaining + " work remaining on " + item.name + ", productivity of " + productivity);
      if (flow.board.itemsInColumn(column).length > 1) {
        if (productivity > 1) {
          productivity -= 1;
          console.log("productivity loss of 1 (now " + productivity + ") due to WIP size on " + column.name);
        }
      }
      let delta = item.workRemaining - productivity;
      if (delta < 0) {
        item.workRemaining = 0;
      }
      else {
        item.workRemaining = delta;
      }
    };

    flow.recordQueueSizes = function() {
      _.each(flow.board.queueColumns(), function(col) {
        // don't record queues outside of the items in progress
        if (col.id >= flow.minItemProgress && col.id <= flow.maxItemProgress) {
          let size = flow.board.itemsInColumn(col).length;
          flow.queueSizes[col.id].push(size);
        }
      });
    };

    flow.recordWipSizes = function() {
      _.each(flow.board.workColumns(), function(col) {
        if (col.id >= flow.minItemProgress && col.id <= flow.maxItemProgress) {
          let size = flow.board.itemsInColumn(col).length;
          flow.wipSizes[col.id].push(size);
        }
      });
    };

    flow.averageQueueSize = function(column) {
      let samples = flow.queueSizes[column.id];
      let total = _.reduce(samples, function(memo, itm) { return memo + itm; }, 0);
      if (samples.length == 0) { return; }
      return (total / samples.length).toFixed(2);
    };

    flow.averageWipSize = function(column) {
      let samples = flow.wipSizes[column.id];
      let total = _.reduce(samples, function(memo, itm) { return memo + itm; }, 0);
      if (samples.length == 0) { return; }
      return (total / samples.length).toFixed(2);
    };

    flow.columnState = function(col) {
      if (!col.idle || col.start || col.end) {
        return "block";
      }
      else if (flow.board.itemsInColumn(col).length >= col.wipLimit) {
        return "block-alert";
      }
      else {
        return "block";
      }
    }

    flow.moveItem = function(item) {
      let newTimestamp = new Date();
      let fromColumn = flow.board.columnById(item.columnId);
      if (fromColumn.end) { return; }

      // try to go to the next

      let toColumn = flow.board.columnById(item.columnId + 1);
      console.log("trying to move " + item.name + " from " + fromColumn.name + " to " + toColumn.name + "...");
      if (!flow.board.columnUnderWipLimit(toColumn)) {
        console.log("...but " + toColumn.name + " is over WIP")
        return;
      }

      if (!fromColumn.start) {
        if (fromColumn.idle) {
          // flow.idleTimes[item.id] += (newTimestamp - item.timestamp);
          item.times['idle'] = item.times['idle'] + (newTimestamp - item.timestamp);
        }
        else {
          // flow.activeTimes[item.id] += (newTimestamp - item.timestamp);
          item.times['active'] = item.times['active'] + (newTimestamp - item.timestamp);
        }
      }
      item.timestamp = newTimestamp;
      item.columnId = toColumn.id;
      item.workRemaining = _.sample(flow.workSizes[flow.workVariability]);
      flow.maxItemProgress = _.max([flow.maxItemProgress, toColumn.id]);
      if (flow.board.itemsRemainingForColumn(fromColumn).length == 0) {
        flow.minItemProgress = toColumn.id;
      }

      if (toColumn.end) {
        if (item.batchId) {
          if (flow.board.batchSatisfied(flow.board.batchById(item.batchId), toColumn.id)) {
            flow.valueTimes.push({'timestamp': newTimestamp, "value": flow.board.valueForBatch(item.batchId)});
          }
        }
        else {
          flow.valueTimes.push({'timestamp': newTimestamp, "value": item.value});
        }
      }
      console.log("...success!");
    };

    flow.idleTimePercentage = function(item) {
        let idleTime = item.times['idle'];
        let totalTime = item.times['active'] + idleTime;
        if (totalTime == 0) {
          return "";
        }
        else {
          return (Math.round((idleTime / totalTime) * 100)) + "%";
        }
    };

    flow.totalActiveTime = function() {
      return _.reduce(flow.board.items, function(memo, itm) { return memo + itm.times['active']; }, 0);
    };

    flow.totalIdleTime = function() {
      return _.reduce(flow.board.items, function(memo, itm) { return memo + itm.times['idle']; }, 0);
    };

    flow.totalTime = function() {
      return flow.totalActiveTime() + flow.totalIdleTime();
    };

    flow.totalIdleTimePercentage = function() {
        if (flow.totalTime() == 0) {
          return "";
        }
        else {
          return (Math.round((flow.totalIdleTime() / flow.totalTime()) * 100)) + "%";
        }
    };

  });

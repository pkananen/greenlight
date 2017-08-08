angular.module('flowMetrics.flow', [])
  .controller('FlowController', function($scope, $interval, FlowBoard) {
    var flow = this;
    flow.board = FlowBoard;

    // number of workers / value per worker s
    flow.historicalNumWorkersPerValuePerWorkerChartData = [0, 0];
    // number of workers / total run time
    flow.historicalNumWorkersPerRunTimeChartData = [0, 0];
    // avg queue size / value rate
    flow.historicalHighestAvgQueuePerValueRateChartData = [0, 0];
    // avg queue size / cycle time
    flow.historicalHighestAvgQueuePerCycleTimeChartData = [0, 0];

    flow.historicalWorkerTimes = [];
    flow.historicalQueues = [];
    flow.historicalWip = [];

    flow.valueTimes = [];
    flow.done = false;
    flow.running = false;
    flow.maxItemProgress = 1;
    flow.minItemProgress = 1;
    flow.timer = undefined;
    flow.batchesOn = false;
    flow.start = undefined;
    flow.end = undefined;
    flow.throughput = "-";
    flow.valueRate = "-";
    flow.arrivalRate = 0;
    flow.avgCycleTime = 0;
    flow.elapsed = 0;
    flow.expectedNumInProgress = '-';
    flow.valueDeliveredPerWorkerTime = "-";

    flow.batchOptions = {'On': true, 'Off': false};
    flow.workSizeOptions = {'Uniform (4)': 0, 'Low (1)': 1, 'High (5-17)': 2};

    flow.workSizes = {0: [4], 1: [1], 2: [5, 7, 11, 17]};
    flow.workVariability = 2;

    flow.workerCountOptions = {'1 Worker': 1, '2 Workers': 2, '3 Workers': 3, '4 Workers': 4};
    flow.workerCounts = {2: 1, 4: 1, 6: 1, 8: 1, 10: 1};
    flow.productivitySizes = {0: [4], 1: [1], 2: [1, 3, 3, 5, 7]};
    flow.productivityVariability = 1;

    flow.queueSizes = {2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10:[]};
    flow.wipSizes = {2: [], 4: [], 6: [], 8: [], 10: []};

    flow.queueWipSizeLabels = _.map([2, 3, 4, 5, 6, 7, 8, 9, 10], function(colId) { return flow.board.columnById(colId).name; });
    flow.queueWipSizeData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    flow.queueWipSizeSeries = ['Avg Queue and WIP Sizes'];
    flow.queueWipSizeOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Column"}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Avg Size"}, ticks: {min: 0, max: 5}}]
      }
    };

    flow.cycleTimeBarChartLabels = _.map(flow.board.items, function(itm) { return itm.name; });
    flow.cycleTimeBarChartSeries = ["Active Time", "Idle Time"];
    flow.cycleTimeBarChartData = [[0], [0]];
    flow.cycleTimeBarChartOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Work Item - Work Completed"}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Cycle Time in Seconds"}, ticks: {min: 0, max: 80}}]
      }
    };

    flow.workerTimesBarChartLabels = [];
    flow.workerTimesBarChartSeries = ["Active Time", "Idle Time"];
    flow.workerTimesBarChartData = [0, 0, 0, 0, 0];
    flow.workerTimesBarChartOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Worker"}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Total Time in Seconds"}, ticks: {min: 0.0, max: 100.0}}]
      }
    };

    flow.valueTimesLabels = [0, 0];
    flow.valueTimesData = [0, 0];
    flow.valueTimesSeries = ['Values', 'Cumulative'];
    flow.valueTimesDatasetOverride = [{ yAxisID: 'y-axis-1' }];
    flow.valueTimesOptions = {
      scales: {
        xAxes: [{ type: 'time',
                  scaleLabel: {display: true, labelString: "Time Delivered"},
                  time: {
                    displayFormats: { 'millisecond': 'mm:ss', 'second': 'mm:ss', 'minute': 'mm:ss', 'hour': 'mm:ss', 'day': 'mm:ss', 'week': 'mm:ss', 'month': 'mm:ss', 'quarter': 'mm:ss', 'year': 'mm:ss' }
                  },
                  ticks: {min: 0.0, max: 100.0}

      }],
        yAxes: [ { id: 'y-axis-1', type: 'linear', display: true, position: 'left', scaleLabel: {display:true, labelString: "$ Delivered"}, ticks: {min: 0, max: 2000}}  ]
      }
    };

    flow.historicalNumWorkersPerValuePerWorkerChartLabels = [0];
    flow.historicalNumWorkersPerValuePerWorkerChartOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Num Workers"}, ticks: {min: 0, max: 20}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Value Per Worker Second"}, ticks: {min: 0.0, max: 10.0}}]
      }
    };

    flow.historicalNumWorkersPerRunTimeChartLabels = [0];
    flow.historicalNumWorkersPerRunTimeChartOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Num Workers"}, ticks: {min: 0, max: 20}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Total Run Time"}, ticks: {min: 0.0, max: 400.0}}]
      }
    };

    flow.historicalHighestAvgQueuePerValueRateChartLabels = [0];
    flow.historicalHighestAvgQueuePerValueRateChartOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Highest Avg Queue Size"}, ticks: {min: 0, max: 20}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Value Rate per Second"}, ticks: {min: 0.0, max: 100.0}}]
      }
    };

    flow.historicalHighestAvgQueuePerCycleTimeChartLabels = [0];
    flow.historicalHighestAvgQueuePerCycleTimeChartOptions = {
      scales: {
        xAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Highest Avg Queue Size"}, ticks: {min: 0, max: 20}}],
        yAxes: [{stacked: true, scaleLabel: {display: true, labelString: "Avg Cycle Time"}, ticks: {min: 0.0, max: 100.0}}]
      }
    };

    flow.updateChart = function() {
      // VALUE
      flow.valueTimesLabels = _.map(flow.valueTimes, function(cd) { return cd.timestamp; });
      let values = _.map(flow.valueTimes, function(cd) { return cd.value; });
      let cumulative = _.reduce(values, function(acc, n) {
        acc.push((acc.length > 0 ? acc[acc.length - 1]: 0 ) + n);
        return acc;
      }, []);
      flow.valueTimesData = cumulative;
      // CYCLE TIMES
      let activeTimes = _.map(flow.board.items, function(itm) { return itm.times['active'] / 1000 ; });
      let idleTimes = _.map(flow.board.items, function(itm) { return itm.times['idle'] / 1000; });
      flow.cycleTimeBarChartData = [activeTimes, idleTimes];

      // QUEUE & WIP SIZES
      let avgQueueWipSizes = _.map([2, 3, 4, 5, 6, 7, 8, 9, 10], function(col) {
        if ((col % 2) == 0) {
          return flow.averageWipSize(flow.board.columnById(col));
        }
        else {
          return flow.averageQueueSize(flow.board.columnById(col));
        }
      });
      flow.queueWipSizeData = [avgQueueWipSizes];
      flow.workerTimesBarChartLabels = _.map(flow.allActiveWorkers(), function(wrkr) { return wrkr.name; });
      let activeWorkerTime = _.map(flow.allActiveWorkers(), function(wrkr) { return (wrkr.times['active'] / 1000).toFixed(2); });
      let idleWorkerTime = _.map(flow.allActiveWorkers(), function(wrkr) { return (wrkr.times['idle'] / 1000).toFixed(2); });
      flow.workerTimesBarChartData = [activeWorkerTime, idleWorkerTime];
      flow.cycleTimeBarChartLabels = _.map(flow.board.items, function(itm) { return itm.name + "-" + itm.workCompleted; });
      // WORKER TIMES

    }

    flow.setWorkSizes = function() {
      _.each(flow.board.items, function(itm) {
        let productivity = _.sample(flow.workSizes[flow.workVariability]);
        itm.workRemaining = productivity;
      });
    }

    flow.resetBoard = function() {
      if (flow.running) { return; };
      if (flow.done) {
        let avgQueue = _.max(_.map([3, 5, 7, 9], function(colId) {
          return flow.averageQueueSize(flow.board.columnById(colId));
        })).toFixed(1);

        flow.historicalNumWorkersPerValuePerWorkerChartData.push({x: flow.allActiveWorkers().length, y: flow.valueDeliveredPerWorkerTime, r: 5});
        flow.historicalNumWorkersPerRunTimeChartData.push({x: flow.allActiveWorkers().length, y: (flow.end - flow.start) / 1000, r: 5});
        flow.historicalHighestAvgQueuePerValueRateChartData.push({x: avgQueue, y: flow.valueRate, r: 5});
        flow.historicalHighestAvgQueuePerCycleTimeChartData.push({x: avgQueue, y: flow.avgCycleTime / 1000, r: 5});

        flow.historicalWorkerTimes.push([
          flow.totalActiveWorkerTime(),
          flow.totalIdleWorkerTime(),
          flow.totalWorkerTime(),
          flow.totalIdleWorkerTimePercentage()]);
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
      flow.board.resetWorkers();
      flow.queueSizes = {2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10:[]};
      flow.wipSizes = {2: [], 4: [], 6: [], 8: [], 10: []};
      flow.maxItemProgress = 1;
      flow.minItemProgress = 1;
      flow.valueTimes = [];
      flow.done = false;
      flow.running = false;
      flow.start = undefined;
      flow.end = undefined;
      flow.throughput = "-";
      flow.valueRate = "-";
      flow.valueTimesLabels = [0, 0];
      flow.valueTimesData = [0, 0];
      flow.cycleTimeBarChartData = [[0], [0]];
      flow.queueWipSizeData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      flow.workerTimesBarChartData = [0, 0, 0, 0, 0];
      flow.expectedNumInProgress = '-';
      flow.elapsed = 0;
      flow.avgCycleTime = 0;
      flow.arrivalRate = 0;
      flow.valueDeliveredPerWorkerTime = "-";
      flow.cycleTimeBarChartLabels = _.map(flow.board.items, function(itm) { return itm.name; });

    };

    flow.updateThroughput = function() {
      if (flow.done) {
        flow.throughput = (20 / ((flow.end - flow.start) / 1000)).toFixed(1);
        flow.valueRate = (flow.valueDelivered() / ((flow.end - flow.start) / 1000)).toFixed(1);
      }
      else if (flow.running) {
        let now = (new Date()).getTime();
        flow.elapsed = now - flow.start;
        flow.throughput = (flow.board.itemsInColumn(flow.board.columnById(11)).length / ((now - flow.start) / 1000)).toFixed(1);
        flow.valueRate = (flow.valueDelivered() / ((flow.elapsed) / 1000)).toFixed(1);
        // avg number in process is arrival rate * avg cycle_time
        // arrival rate is number started per second
        flow.arrivalRate = flow.board.itemsStarted().length / (flow.elapsed);
        let cycleTimes = _.map(flow.board.itemsCompleted(), function(itm) {
          return itm.times['active'] + itm.times['idle'];
        });
        flow.avgCycleTime = _.sum(cycleTimes) / flow.board.itemsCompleted().length;
        flow.expectedNumInProgress = Math.round(flow.arrivalRate * flow.avgCycleTime);
        flow.valueDeliveredPerWorkerTime = (flow.valueDelivered() / (flow.totalWorkerTime() / 1000)).toFixed(1);
      }
      else {
        flow.throughput = "-";
        flow.valueRate = "-";
        flow.expectedNumInProgress = "-";
        flow.valueDeliveredPerWorkerTime = "-";
      }
    }

    flow.play = function() {
      flow.running = true;
      flow.start = (new Date()).getTime();
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
      let newTimestamp = new Date();
      flow.elapsed = newTimestamp - flow.start;
      if (flow.board.itemsInColumn(flow.board.columnById('11')).length == flow.board.items.length) {
        $interval.cancel(flow.timer);
        flow.done = true;
        flow.running = false;
        flow.end = (new Date()).getTime();
        console.log("Done!");
      }
      else {
        flow.recordQueueSizes();
        flow.recordWipSizes();
        flow.tickWorkers();
      }
    };

    flow.columnWipLimit = function(column) {
      if (column.idle) {
        return column.wipLimit;
      }
      else {
        return flow.workerCounts[column.id];
      }
    }

    flow.columnUnderWipLimit = function(column) {
      return (flow.board.itemsInColumn(column)).length < flow.columnWipLimit(column);
    }

    flow.activeWorkersForColumn = function(column) {
      return _.slice(flow.board.workersForColumn(column), 0, flow.workerCounts[column.id]);
    }

    flow.allActiveWorkers = function() {
      let workers = _.map(flow.board.columns, function(col) {
        return flow.activeWorkersForColumn(col);
      });
      return _.flatten(workers);
    }

    flow.tickWorkers = function() {
      let startForNewWorker = new Date();
      let walkTheBoard = _.shuffle(flow.board.workColumns());
      _.each(walkTheBoard, function(workColumn) {
        console.log("ticking column " + workColumn.name);
        for (i = 0; i < flow.workerCounts[workColumn.id]; i++) {
          let wrkr = flow.board.workers[workColumn.id][i];
          if (wrkr.timestamp == 0) {
            wrkr.timestamp = startForNewWorker;
          }
          let newTimestamp = new Date();
          console.log("ticking worker " + wrkr.name);
          let workItem = _.first(flow.board.itemsForWorker(wrkr));
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
            // log worker as being productive if they are in the scope of active work
            // if (workColumn.id >= flow.minItemProgress && workColumn.id <= flow.maxItemProgress) {
              wrkr.times['active'] = wrkr.times['active'] + (newTimestamp - wrkr.timestamp);
            // }
          }
          else {
            // log worker as unproductive if they are in the scope of active work
            // if (workColumn.id >= flow.minItemProgress && workColumn.id <= flow.maxItemProgress) {
              wrkr.times['idle'] = wrkr.times['idle'] + (newTimestamp - wrkr.timestamp);
            // }
          }
          wrkr.timestamp = newTimestamp;
        }
        if (workColumn.id > 1) {
          while (flow.columnUnderWipLimit(workColumn)) {

            let pullColumn = flow.board.columnById(workColumn.id - 1);
            let itemToPull = _.sample(flow.board.itemsInColumn(pullColumn));
            if (pullColumn.start) {
              itemToPull = _.first(flow.board.itemsInColumn(pullColumn));
            }
            // with heavy queues, lose a cycle 25% of the time
            if ((flow.board.itemsInColumn(pullColumn).length > 1) && (_.sample([1, 2, 3, 4]) == 4)) {
              console.log("heavy WIP in Queue " + pullColumn.id + ", randomly lost a work cycle");
              break;
            }
            if (itemToPull) {
              let itemBatch = flow.board.batchById(itemToPull.batchId);
              // make sure the batch applies to this column
              if (flow.batchesOn && itemBatch && _.includes(itemBatch.columns, pullColumn.id)) {
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
      let productivity = _.sample(flow.productivitySizes[2]);
      console.log(item.workRemaining + " work remaining on " + item.name + ", productivity of " + productivity);
      if (flow.board.itemsInColumn(column).length > 1) {
        if (productivity > 1) {
          productivity -= 2;
          console.log("productivity loss of 2 (now " + productivity + ") due to WIP size on " + column.name);
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
      return total / samples.length;
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
      else if (!flow.columnUnderWipLimit(col)) {
        return "block-alert";
      }
      else {
        return "block";
      }
    }

    flow.moveItem = function(item) {
      item.workCompleted += item.workRemaining;
      let newTimestamp = new Date();
      let fromColumn = flow.board.columnById(item.columnId);
      if (fromColumn.end) { return; }

      let toColumn = flow.board.columnById(item.columnId + 1);
      console.log("trying to move " + item.name + " from " + fromColumn.name + " to " + toColumn.name + "...");
      if (!flow.columnUnderWipLimit(toColumn)) {
        console.log("...but " + toColumn.name + " is over WIP or doesn't have enough workers")
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
      if (fromColumn.idle) {
        let worker = flow.board.nextWorkerForColumn(toColumn);
        item.workerId = worker.id;
        worker.itemId = item.id;
      }
      else {
        let worker = flow.board.workerById(item.workerId);
        worker.itemId = undefined;
        item.workerId = undefined;
      }
      flow.maxItemProgress = _.max([flow.maxItemProgress, toColumn.id]);
      if (flow.board.itemsRemainingForColumn(fromColumn).length == 0) {
        flow.minItemProgress = toColumn.id;
      }

      if (toColumn.end) {
        flow.updateThroughput();
        if (flow.batchesOn && item.batchId) {
          if (flow.board.batchSatisfied(flow.board.batchById(item.batchId), toColumn.id)) {
            flow.valueTimes.push({'timestamp': newTimestamp, "value": flow.board.valueForBatch(item.batchId)});
            flow.updateChart();
          }
        }
        else {
          flow.valueTimes.push({'timestamp': newTimestamp, "value": item.value});
          flow.updateChart();
        }
      }
      else {
        item.workRemaining = Math.round(_.sample(flow.workSizes[flow.workVariability]) * item.sizeFactor);
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

    flow.idleWorkerTimePercentage = function(worker) {
        let idleTime = worker.times['idle'];
        let totalTime = worker.times['active'] + idleTime;
        if (totalTime == 0) {
          return "";
        }
        else {
          return (Math.round((idleTime / totalTime) * 100)) + "%";
        }
    };

    flow.batchStyle = function(item) {
      if (flow.batchesOn) {
        if (item.batchId) {
          return "batch-" + item.batchId;
        }
        else {
          return "batch-0";
        }
      }
      else {
        return "batch-0";
      }
    }

    // Item Times
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

    // Worker Times
    flow.totalActiveWorkerTime = function() {
      return _.reduce(flow.board.allWorkers(), function(memo, wrkr) { return memo + wrkr.times['active']; }, 0);
    };

    flow.totalIdleWorkerTime = function() {
      return _.reduce(flow.board.allWorkers(), function(memo, wrkr) { return memo + wrkr.times['idle']; }, 0);
    };

    flow.totalWorkerTime = function() {
      return flow.totalActiveWorkerTime() + flow.totalIdleWorkerTime();
    };

    flow.totalIdleWorkerTimePercentage = function() {
        if (flow.totalWorkerTime() == 0) {
          return "";
        }
        else {
          return (Math.round((flow.totalIdleWorkerTime() / flow.totalWorkerTime()) * 100)) + "%";
        }
    };

  });

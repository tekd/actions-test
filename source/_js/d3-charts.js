const D3Chart = {
  data: [],
  htmlTableToJson(chart) {
    // debugger;
    let headers = Array.from(chart.firstChild.querySelectorAll('th')).map(th => th.innerHTML);
    let cells = Array.from(chart.firstChild.querySelectorAll('td')).map(td => td.innerHTML);
    let numRows = cells.length / headers.length; // 6
    let numCols = headers.length; // 2

    let dividedCells = [];
    for (let i = 0; i < cells.length; i += numCols) {
      // console.log(i, numRows);
      let subArray = cells.slice(i, i + numCols);
      // console.log(subArray);
      dividedCells.push(subArray);
    }
    // console.log(dividedCells);
    dividedCells.map((container, idx) => {
      let dataContainer = new Object();
      container.forEach((cell, idx) => {
        dataContainer[headers[idx]] = cell;
      });
      this.data.push(dataContainer);
    });
    console.log(this.data);
  },
  gatherTables() {
    let activeTables = document.querySelectorAll('.d3-chart');
    activeTables.forEach(chart => {
      this.createChart(chart);
    });
  },
  createChart(chart) {
    let jsonData = this.htmlTableToJson(chart);
    console.log(jsonData);
  },
  init() {
    console.log('hi chart');
    this.gatherTables();
  }
};

module.exports = D3Chart;

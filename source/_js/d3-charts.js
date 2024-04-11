const D3 = require('d3');
const D3Chart = {
  htmlTableToJson(chart) {
    let data = []; // debugger;
    // let headers = Array.from(chart.firstChild.querySelectorAll('th')).map(th => th.innerHTML);
    let headers = ['label', 'value'];
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
      data.push(dataContainer);
    });
    return data;
  },
  gatherTables() {
    let activeTables = document.querySelectorAll('.d3-chart');
    activeTables.forEach(chart => {
      if (chart.classList.contains('d3-pie-chart')) {
        this.createPieChart(chart);
      }
    });
    console.log(activeTables);
  },
  createPieChart(chart) {
    const data = this.htmlTableToJson(chart);

    let chartAttrs = this.getPieChartAttributes();

    this.appendPieChartContainer(chart);

    let viz = D3.select(`#${chart.id}-chart`)
      .append('svg:svg')
      .data([data])
      .attr('width', chartAttrs.width)
      .attr('height', chartAttrs.height)
      .append('svg:g')
      .attr('transform', 'translate(' + chartAttrs.radius + ',' + chartAttrs.radius + ')');

    let pie = D3.pie().value(function(d) {
      console.log(d, 'pie');
      return d.value;
    });

    // console.log(pie)
    let arc = D3.arc()
      .innerRadius(0)
      .outerRadius(chartAttrs.radius);

    let arcs = viz
      .selectAll('g.slice')
      .data(pie)
      .enter()
      .append('svg:g')
      .attr('class', 'slice');

    arcs
      .append('svg:path')
      .attr('fill', function(d, i) {
        console.log(chartAttrs.color(i));
        return chartAttrs.color(i);
      })
      .attr('d', arc);

    // arc-text
  
    arcs
      .append('svg:text')
      
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('transform', function(d) {
        d.innerRadius = 0;
        d.outerRadius = chartAttrs.radius;
        
        return 'translate(' + arc.centroid(d) +  ')';
      })
      .attr('text-anchor', 'middle')
      .text(function(d, i) {
        return data[i].value;
      });

    // arc labels
  },
  /* pie chart methods start */
  getPieChartAttributes() {
    return {
      width: 300,
      height: 300,
      radius: 100,
      color: D3.scaleOrdinal()
        .domain([0, 6])
        .range(['#F1892D', '#0EAC51', '#0077C0', '#7E349D', '#DA3C78', '#E74C3C'])
    };
  },
  appendPieChartContainer(chart) {
    let chartLocation = document.getElementById(chart.id);
    console.log(chartLocation);
    let visualizationContainer = document.createElement('div');
    visualizationContainer.setAttribute('id', `${chart.id}-chart`);
    visualizationContainer.setAttribute('class', 'visualization');
    chartLocation.insertAdjacentElement('afterend', visualizationContainer);
  },
  /* pie chart methids end */
  createChart(chart) {
    let jsonData = this.htmlTableToJson(chart);
  },
  init() {
    console.log('hi chart');
    this.gatherTables();
  }
};

module.exports = D3Chart;

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
    // begin vars
    let chartAttrs = this.getPieChartAttributes();
    const data = this.htmlTableToJson(chart);

    const pieArcData = D3.pie().value(d => {
      return d.value;
    })(data);

    const arcLabel = D3.arc()
      .innerRadius(chartAttrs.innerRadius)
      .outerRadius(chartAttrs.labelRadius)
      .cornerRadius(chartAttrs.cornerRadius);

    const arcPie = D3.arc()
      .innerRadius(chartAttrs.innerRadius)
      .outerRadius(chartAttrs.outerRadius)
      .padRadius(chartAttrs.padRadius)
      .padAngle(chartAttrs.padAngle)
      .cornerRadius(chartAttrs.cornerRadius);

    const midAngle = d => {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    };

    // end vars

    this.appendPieChartContainer(chart);

    // create the svg
    let svg = D3.select(`#${chart.id}-chart`)
      .append('svg')
      .attr('width', chartAttrs.width)
      .attr('height', chartAttrs.height)
      .attr('viewBox', [-chartAttrs.width / 2, -chartAttrs.height / 2, chartAttrs.width, chartAttrs.height]);

    svg
      .append('g')
      .selectAll('path')
      .data(pieArcData)
      .join('path')
      .attr('fill', (d, i) => chartAttrs.color(i))
      .attr('d', arcPie)
      .attr('title', d => d.label);

    svg
      .append('g')
      .selectAll('polyline')
      .data(pieArcData)
      .join('polyline')
      .attr('stroke', '#aaa')
      .attr('opacity', '.3')
      .attr('stroke-width', '1px')
      .attr('fill', 'none')
      .attr('points', d => {
        const pos = arcLabel.centroid(d);
        const pieCenter = arcPie.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
        console.log(pieCenter, arcLabel.centroid(d), pos);
        return [pieCenter, arcLabel.centroid(d), pos];
      });

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 14)
      .attr('fill', 'black')
      .selectAll('text')
      .data(pieArcData)
      .join('text')
      .attr('transform', d => {
        var pos = arcLabel.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => (midAngle(d) < Math.PI ? 'start' : 'end'))
      .text(d => {
        return d.data.label;
      });

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .selectAll('text')
      .data(pieArcData)
      .join('text')
      .attr('transform', d => {
        const pieCenter = arcPie.centroid(d);
        return `translate(${pieCenter})`;
      })
      .text(d => {
        return d.value;
      });
  },
  /* pie chart methods start */
  getPieChartAttributes() {
    return {
      width: 1000,
      height: 500,
      radius: 0,
      innerRadius: 0,
      outerRadius: 200,
      labelRadius: 300,
      cornerRadius: 0,
      padRadius: 0,
      padAngle: 0,
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

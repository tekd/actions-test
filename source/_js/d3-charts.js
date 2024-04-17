const d3 = require('d3');
const d3Chart = {
  htmlTableToJson(chart) {
    let data = []; // debugger;
    let headers = Array.from(chart.firstChild.querySelectorAll('th')).map(th => th.innerHTML);
    // let headers = ['label', 'value'];
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
      } else if (chart.classList.contains('d3-bar-chart')) {
        this.createBarChart(chart);
      }
    });
    console.log(activeTables);
  },
  createBarChart(chart) {
    // https://observablehq.com/@d3/stacked-bar-chart/2
    let data = this.htmlTableToJson(chart);
    let headers = Object.keys(data[0]);

    // headers[0] xAxis - state
    // headers[1] stacked content - age
    // headers[2] yAXIS - population

    // Determine the series that need to be stacked.

    const series = d3
      .stack()
      .keys(d3.union(data.map(d => d[headers[1]]))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key)[headers[2]])(
      // get value for each series key and stack
      d3.index(
        data,
        d => d[headers[0]], // x axis
        d => d[headers[1]] // stacked content
      )
    ); // group by stack then series key
    console.log(data);
    console.log(series);
    // debugger
    this.appendChartContainer(chart);

    let chartAttrs = this.getBarChartAttributes();

    // Prepare the scales for positional and color encodings.
    const x = d3
      .scaleBand()
      .domain(
        d3.groupSort(
          data,
          D => -d3.sum(D, d => d[headers[2]]),
          d => d[headers[0]]
        )
      )
      .range([chartAttrs.margin.left, chartAttrs.width - chartAttrs.margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([chartAttrs.height - chartAttrs.margin.bottom, chartAttrs.margin.top]);

    const color = d3
      .scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeSpectral[series.length])
      .unknown('#ccc');

    // A function to format the value in the tooltip.
    const formatValue = x => (isNaN(x) ? 'N/A' : x.toLocaleString('en'));

    // create svg
    let svg = d3
      .select(`#${chart.id}-chart`)
      .append('svg')
      .attr('width', chartAttrs.width)
      .attr('height', chartAttrs.height)
      .attr('viewBox', [0, 0, chartAttrs.width, chartAttrs.height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Append a group for each series, and a rect for each element in the series.
    svg
      .append('g')
      .selectAll()
      .data(series)
      .join('g')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(D => D.map(d => ((d.key = D.key), d)))
      .join('rect')
      .attr('x', d => x(d.data[0]))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .append('title')
      .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key)[headers[2]])}`);

    // Append the horizontal axis.
    svg
      .append('g')
      .attr('transform', `translate(0,${chartAttrs.height - chartAttrs.margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll('.domain').remove());

    // Append the vertical axis.
    svg
      .append('g')
      .attr('transform', `translate(${chartAttrs.margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call(g => g.selectAll('.domain').remove());

    // Return the chart with the color scale as a property (for the legend).
    return Object.assign(svg.node(), { scales: { color } });
  },
  getBarChartAttributes() {
    return {
      margin: { top: 10, right: 10, bottom: 20, left: 40 },
      width: 928,
      height: 500,
      color: d3
        .scaleOrdinal()
        .domain([0, 3])
        .range(['pink', 'teal', 'yellow', 'magenta'])
    };
  },
  createPieChart(chart) {
    this.appendChartContainer(chart);

    const data = this.htmlTableToJson(chart);
    const headers = Object.keys(data[0]);

    // begin vars
    let chartAttrs = this.getPieChartAttributes();
    console.log(chartAttrs, 'chartAttrs');

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    let radius = Math.min(chartAttrs.width, chartAttrs.height) / 2 - chartAttrs.margin;

    // Compute the position of each group on the pie
    const pie = d3.pie().value(d => {
      return d[headers[1]];
    })(data);

    // shape helper to build arcs:
    const arc = d3
      .arc()
      .innerRadius(chartAttrs.innerRadius)
      .outerRadius(chartAttrs.outerRadius);

    const arcLabel = d3
      .arc()
      .innerRadius(chartAttrs.innerRadius)
      .outerRadius(chartAttrs.labelRadius);

    const midAngle = d => {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    };

    // end vars

    // create the svg
    let svg = d3
      .select(`#${chart.id}-chart`)
      .append('svg')
      .attr('width', chartAttrs.width)
      .attr('height', chartAttrs.height)
      .attr('viewBox', [-chartAttrs.width / 2, -chartAttrs.height / 2, chartAttrs.width, chartAttrs.height]);

    svg
      .append('g')
      .selectAll('path')
      .data(pie)
      .join('path')
      .attr('fill', (d, i) => chartAttrs.color(i))
      .attr('d', arc)
      .attr('title', d => d[headers[0]]);

    svg
      .append('g')
      .selectAll('polyline')
      .data(pie)
      .join('polyline')
      .attr('stroke', '#aaa')
      .attr('opacity', '.3')
      .attr('stroke-width', '1px')
      .attr('fill', 'none')
      .attr('points', d => {
        const pos = arcLabel.centroid(d);
        const pieCenter = arc.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1 * (midAngle(d) < Math.PI ? 1 : -1);

        return [pieCenter, arcLabel.centroid(d), pos];
      });

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 14)
      .attr('fill', 'black')
      .selectAll('text')
      .data(pie)
      .join('text')
      .attr('transform', d => {
        var pos = arcLabel.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => (midAngle(d) < Math.PI ? 'start' : 'end'))
      .text(d => {
        return d.data[headers[0]];
      });

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .selectAll('text')
      .data(pie)
      .join('text')
      .attr('transform', d => {
        const pieCenter = arc.centroid(d);
        return `translate(${pieCenter})`;
      })
      .text(d => {
        return d[headers[1]];
      });
  },
  /* pie chart methods start */
  getPieChartAttributes() {
    return {
      width: 600,
      height: 450,
      innerRadius: 0,
      outerRadius: 200,
      labelRadius: 300,
      color: d3
        .scaleOrdinal()
        .domain([0, 6])
        .range(['#F1892D', '#0EAC51', '#0077C0', '#7E349D', '#DA3C78', '#E74C3C'])
    };
  },
  appendChartContainer(chart) {
    console.log(chart);

    let chartLocation = document.getElementById(chart.id);
    
    let visualizationContainer = document.createElement('div');
    visualizationContainer.setAttribute('id', `${chart.id}-chart`);
    visualizationContainer.setAttribute('class', 'visualization');
    chartLocation.insertAdjacentElement('afterend', visualizationContainer);
  },
  /* pie chart methods end */
  createChart(chart) {
    let jsonData = this.htmlTableToJson(chart);
  },
  init() {
    console.log('hi chart');
    this.gatherTables();
  }
};

module.exports = d3Chart;

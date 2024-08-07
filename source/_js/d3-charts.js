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
      let subArray = cells.slice(i, i + numCols);
      dividedCells.push(subArray);
    }

    dividedCells.map((container, idx) => {
      let dataContainer = new Object();
      container.forEach((cell, idx) => {
        dataContainer[headers[idx]] = cell;
      });
      data.push(dataContainer);
    });
    return data;
  },
  htmlTableToCsv(chart) {
    let data = []; // debugger;
    let headers = Array.from(chart.firstChild.querySelectorAll('th')).map(th => th.innerHTML);
    // let headers = ['label', 'value'];
    let cells = Array.from(chart.firstChild.querySelectorAll('td')).map(td => td.innerHTML);
    let numRows = cells.length / headers.length; // 6
    let numCols = headers.length; // 2

    let dividedCells = [];
    dividedCells += headers.join(',') + '\n';
    for (let i = 0; i < cells.length; i += numCols) {
      let subArray = cells.slice(i, i + numCols);
      dividedCells += subArray.join(',') + '\n';
    }
    return dividedCells;
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
  },
  createBarChart(chart) {
    // https://observablehq.com/@d3/stacked-bar-chart/2
    let csvData = this.htmlTableToCsv(chart);

    let data = Object.assign(d3.csvParse(csvData, d3.autoType));

    // List of subgroups = header of the csv files
    let subgroups = data.columns.slice(1);
    // create the stacks -- column 1 is x axis, row 1 is stacked content
    let stackedData = d3.stack().keys(subgroups)(data);

    let headers = data.columns;

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    let groups = d3.map(data, function (data) {
      return data[headers[0]]; //requires the x axis to be the first column
    });

    this.appendChartContainer(chart);

    let chartAttrs = this.getBarChartAttributes();
    // create svg and append under the table

    let svg = d3
      .select(`#${chart.id}-chart`)
      .append('svg')
      .attr('width', chartAttrs.width + chartAttrs.margin.left + chartAttrs.margin.right)
      .attr('height', chartAttrs.height + chartAttrs.margin.top + chartAttrs.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + chartAttrs.margin.left + ',' + chartAttrs.margin.top + ')');

    // Prepare the scales for positional and color encodings.
    // Add x axis

    const x = d3
      .scaleBand()
      .domain(groups)
      .range([0, chartAttrs.width])
      .padding([0.2]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + chartAttrs.height + ')')
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // add y axis
    // assign column of stacked values (header[1]) converted to series 'data' attr of series to get max domain, currrently hardcoded to

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(stackedData, d => {
          // get yMax for appropriate ticks
          return d3.max(d, d => d[1]);
        })
      ])
      .range([chartAttrs.height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    svg.append('g').call(d3.axisLeft(y));

    // color palette generated by number of subgroups
    const color = d => {
      const scale = d3.scaleOrdinal(d3.schemeTableau10).domain(subgroups);
      // debugger
      return scale(d.key);
    };

    svg
      .append('g')
      .selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', d => {
        return color(d);
      })
      .selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => {
        return d;
      })
      .enter()
      .append('rect')
      .attr('x', d => {
        return x(d.data[headers[0]]);
      })
      .attr('y', d => {
        return y(d[1]);
      })
      .attr('height', d => {
        return y(d[0]) - y(d[1]);
      })
      .attr('width', x.bandwidth());
  },
  getBarChartAttributes() {
    return {
      margin: { top: 10, right: 10, bottom: 20, left: 40 },
      width: 928,
      height: 500
    };
  },
  createPieChart(chart) {
    this.appendChartContainer(chart);

    const data = this.htmlTableToJson(chart);
    const headers = Object.keys(data[0]);

    // begin vars
    const chartAttrs = this.getPieChartAttributes();

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(chartAttrs.width, chartAttrs.height) / 2 - chartAttrs.margin;

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
      .attr('title', d => d[headers[0]])
      .attr('data-item', d => d.index)
      .on('mouseover', (e, d) => {
        const decendents = Array.prototype.slice.call(e.target.parentNode.children);
        decendents.forEach(child => {
          if (parseInt(child.getAttribute('data-item')) !== d.index) {
            d3.select(child)
              .transition()
              .attr('opacity', '.4');
          }
        });
        document.querySelectorAll(`.pie-legend-item--${chart.id}`).forEach(item => {
          if (parseInt(item.getAttribute('data-item')) !== d.index) {
            item.style.opacity = '.4';
          }
        });
      })
      .on('mouseout', (e, d) => {
        const decendents = Array.prototype.slice.call(e.target.parentNode.children);
        decendents.forEach(child => {
          d3.select(child)
            .transition()
            .attr('opacity', '1');
        });
        document.querySelectorAll(`.pie-legend-item--${chart.id}`).forEach(item => {
          if (parseInt(item.getAttribute('data-item')) !== d.index) {
            item.style.opacity = '1';
          }
        });
      });

    svg
      .append('g')
      .selectAll('polyline')
      .data(pie)
      .join('polyline')
      .attr('stroke', '#aaa')
      .attr('opacity', '.3')
      .attr('stroke-width', '1px')
      .attr('fill', 'none')
      .attr('data-item', d => d.index)
      .attr('class', `pie-legend-item--${chart.id}`)
      .attr('points', d => {
        const pos = arcLabel.centroid(d);
        const pieCenter = arc.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1.3 * (midAngle(d) < Math.PI ? 1 : -1);
        // return [pieCenter, arcLabel.centroid(d), pos];
        return [arcLabel.centroid(d), pos];
      });

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 14)
      .attr('fill', 'black')
      .selectAll('text')
      .data(pie)
      .join('text')
      .attr('class', `pie-legend-item--${chart.id}`)
      .attr('data-item', d => d.index)
      .attr('transform', d => {
        const pos = arcLabel.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1 * (midAngle(d) < Math.PI ? 0.89 : -1.3);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => (midAngle(d) < Math.PI ? 'start' : 'start'))
      .attr('dy', '-5')
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

    // Value inside slice
    svg
      .append('g')
      .selectAll('polyline')
      .data(pie)
      .enter()
      .append('text')
      .text(d => d.data.number_of_cases)
      .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
      .attr('class', `pie-legend-item--${chart.id}`)
      .attr('data-item', d => d.index)
      .style('font-size', 20);

    // Percentage
    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 13)
      .attr('fill', 'gray')
      .selectAll('text')
      .data(pie)
      .join('text')
      .attr('transform', d => {
        const pos = arcLabel.centroid(d);
        pos[0] = chartAttrs.labelRadius * 1 * (midAngle(d) < Math.PI ? 1.3 : -1.175);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => (arc(d) < Math.PI ? 'start' : 'end'))
      .text(d => `${Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100 * 10) / 10}%`)
      .attr('class', `pie-legend-item--${chart.id}`)
      .attr('data-item', d => d.index)
      .attr('dy', '15');

    // Circle dot
    svg
      .selectAll('marker')
      .data(pie)
      .enter()
      .append('circle')
      .style('stroke', 'gray')
      .style('fill', 'gray')
      .attr('r', 2)
      .attr('transform', d => {
        const pos = arcLabel.centroid(d);
        return `translate(${pos})`;
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
    let chartLocation = document.getElementById(chart.id);

    let visualizationContainer = document.createElement('div');
    visualizationContainer.setAttribute('id', `${chart.id}-chart`);
    visualizationContainer.setAttribute('class', 'visualization');
    chartLocation.insertAdjacentElement('beforebegin', visualizationContainer);
  },
  /* pie chart methods end */
  createChart(chart) {
    let jsonData = this.htmlTableToJson(chart);
  },
  init() {
    this.gatherTables();
  }
};

module.exports = d3Chart;

const MarkdownCharts = {
  addLabelsToBarCharts() {
    const allBarCharts = document.querySelectorAll('table.charts-css > tbody');
    let yMax;
    allBarCharts.forEach(chart => {
      // get yMAx
      let yValues = Array.from(chart.getElementsByTagName('tr')).reduce((acc, tr) => {
        const valEl = tr.childNodes[1];
        return acc.concat(parseInt(valEl.innerHTML));
      }, []);

      yMax = Math.max(...yValues);

      Array.from(chart.getElementsByTagName('tr')).forEach(tr => {
        const oldLabelEl = tr.childNodes[0];
        const newLabelEl = document.createElement('th');
        newLabelEl.innerHTML = tr.childNodes[0].innerHTML;

        tr.replaceChild(newLabelEl, oldLabelEl);

        const valEl = tr.childNodes[1];
        const valPercentage = (100 * parseInt(valEl.innerHTML)) / yMax;
        // debugger;
        valEl.style = `--size:${valPercentage / 100}`;
        
      });
    });
  },
  // addChartStyles() {
  //   document
  //     .querySelectorAll('table')
  //     .forEach(table =>
  //       table.classList.add(
  //         'charts-css',
  //         'column',
  //         'show-heading',
  //         'show-labels',
  //         'show-primary-axis',
  //         'show-4-secondary-axes',
  //         'show-data-axes',
  //         'data-spacing-15',
  //         'hide-data'
  //       )
  //     );
  // },
  init() {
    // this.addChartStyles();
    this.addLabelsToBarCharts();
  }
};

export default MarkdownCharts;

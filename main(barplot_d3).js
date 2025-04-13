let width = 600, height = 400;

let margin = {
  top: 50,
  bottom: 50,
  right: 50,
  left: 60
};

let svg = d3.select('#bar-chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', 'white');

d3.csv("car_price_dataset.csv").then(raw => {
  console.log("CSV Sample Row:", raw[0]);

  let prices = raw.map(d => {
    let val = d.price || d.Price || d.car_price;
    return +String(val).replace(/[^\d.]/g, '');
  }).filter(d => !isNaN(d));

  let binGenerator = d3.bin()
    .domain(d3.extent(prices))
    .thresholds(8); 

  let bins = binGenerator(prices);

  let xscale = d3.scaleLinear()
    .domain([bins[0].x0, bins[bins.length - 1].x1])
    .range([margin.left, width - margin.right]);

  let yscale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append('g')
    .call(d3.axisLeft(yscale))
    .attr('transform', `translate(${margin.left}, 0)`);

  svg.append('g')
    .call(d3.axisBottom(xscale).tickFormat(d3.format("$.2s")))
    .attr('transform', `translate(0, ${height - margin.bottom})`);

  svg.append('text')
    .text('Car Price')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .style('font-weight', 'bold');

  svg.append('text')
    .text('Frequency (Number of Cars)')
    .attr('x', -height / 2)
    .attr('y', 20)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .style('font-weight', 'bold');

  svg.selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', d => xscale(d.x0) + 1)
    .attr('y', d => yscale(d.length))
    .attr('width', d => Math.max(0, xscale(d.x1) - xscale(d.x0) - 1))
    .attr('height', d => height - margin.bottom - yscale(d.length))
    .attr('fill', 'steelblue');
});

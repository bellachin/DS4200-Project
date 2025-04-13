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

  /*svg.selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', d => xscale(d.x0) + 1)
    .attr('y', d => yscale(d.length))
    .attr('width', d => Math.max(0, xscale(d.x1) - xscale(d.x0) - 1))
    .attr('height', d => height - margin.bottom - yscale(d.length))
    .attr('fill', 'steelblue');*/

  svg.selectAll('rect')
  .data(bins)
  .enter()
  .append('rect')
  .attr('x', d => xscale(d.x0) + 1)
  .attr('y', d => yscale(d.length))
  .attr('width', d => Math.max(0, xscale(d.x1) - xscale(d.x0) - 1))
  .attr('height', d => height - margin.bottom - yscale(d.length))
  .attr('fill', 'steelblue')
  .on("click", function(event, d) {
    // d contains the properties x0 and x1 for the bin boundaries.
    let lowerBound = d.x0, upperBound = d.x1;

    // Filter the original raw data based on the selected price range.
    let filteredData = raw.filter(item => {
      let val = item.price || item.Price || item.car_price;
      let price = +String(val).replace(/[^\d.]/g, '');
      return price >= lowerBound && price < upperBound;
    });
    updateLinkedBarChart(filteredData);
  });

  function updateLinkedBarChart(filteredData) {
    // Group data by Brand and compute average Price for each Brand
    let brandData = d3.rollups(
      filteredData,
      v => d3.mean(v, d => +d.Price),  // Use "Price" column here
      d => d.Brand                   // Use "Brand" column
    ).map(([brand, avgPrice]) => ({ brand, avgPrice }));
  
    // Remove the existing linked bar chart (if any) to update cleanly
    d3.select("#linked-bar-chart").selectAll("svg").remove();
  
    let width2 = 600, height2 = 400;
    let margin2 = { top: 50, bottom: 50, left: 60, right: 50 };
  
    let svg2 = d3.select("#linked-bar-chart")
      .append("svg")
      .attr("width", width2)
      .attr("height", height2)
      .style("background", "white");
  
    let xScale2 = d3.scaleBand()
      .domain(brandData.map(d => d.brand))
      .range([margin2.left, width2 - margin2.right])
      .padding(0.1);
  
    let yScale2 = d3.scaleLinear()
      .domain([0, d3.max(brandData, d => d.avgPrice)])
      .nice()
      .range([height2 - margin2.bottom, margin2.top]);
  
    // Draw axes for linked bar chart
    svg2.append('g')
      .attr("transform", `translate(${margin2.left}, 0)`)
      .call(d3.axisLeft(yScale2));
  
    svg2.append('g')
      .attr("transform", `translate(0, ${height2 - margin2.bottom})`)
      .call(d3.axisBottom(xScale2));
  
    // Draw bars representing the average Price by Brand
    svg2.selectAll("rect")
      .data(brandData)
      .enter()
      .append("rect")
      .attr("x", d => xScale2(d.brand))
      .attr("y", d => yScale2(d.avgPrice))
      .attr("width", xScale2.bandwidth())
      .attr("height", d => height2 - margin2.bottom - yScale2(d.avgPrice))
      .attr("fill", "crimson");
  
    // Optional: add title for the linked bar chart
    svg2.append("text")
      .text("Average Price by Brand")
      .attr("x", width2 / 2)
      .attr("y", margin2.top / 2)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold");
  }
  
});

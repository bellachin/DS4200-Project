// Set dimensions and margins for the scatter plot
const width = 650,
      height = 500;
const margin = { top: 60, right: 50, bottom: 60, left: 80 };

// Create the SVG container inside the scatter-plot div
const svg = d3.select("#scatter-plot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define scales for x and y axes; note that xScale will be updated based on the selected feature.
let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// Append groups for the axes
const xAxisGroup = svg.append("g")
  .attr("transform", `translate(0, ${height - margin.bottom})`);
const yAxisGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, 0)`);

  // Append y-axis label
svg.append("text")
.attr("class", "y-axis-label")
.attr("transform", "rotate(-90)")  // Rotate the label to make it vertical
.attr("x", -height / 2)  // Position the label at the center vertically
.attr("y", 20)  // Adjust the position from the top margin
.attr("text-anchor", "middle")  // Center the text horizontally
.text("Price");


// Load CSV data and process numeric columns
d3.csv("car_price_dataset.csv").then(data => {
  // Convert columns to numbers using the actual column names
  data.forEach(d => {
    d.Price = +String(d.Price).replace(/[^\d.]/g, '');
    d.Mileage = +String(d.Mileage).replace(/[^\d.]/g, '');
    d.Engine_Size = +String(d.Engine_Size).replace(/[^\d.]/g, '');
    d.Year = +d.Year.replace(/[^\d.]/g, '');
    d.Doors = +d.Doors.replace(/[^\d.]/g, '');
    d.Owner_Count = +d.Owner_Count.replace(/[^\d.]/g, '');
  });

  // List of numeric features to choose from
const numericFeatures = ["Mileage", "Engine_Size", "Year", "Doors", "Owner_Count"];

// Populate the dropdown menu
const dropdown = d3.select("#featureSelect");
dropdown.selectAll("option")
  .data(numericFeatures)
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);


  // Set the domain for the yScale based on Price
  yScale.domain([0, d3.max(data, d => d.Price)]).nice();
  yAxisGroup.call(d3.axisLeft(yScale));

  // Function to update the scatter plot based on the selected feature
  function updateScatterPlot(feature) {
    // Update the xScale domain based on the selected feature
    xScale.domain([0, d3.max(data, d => d[feature])]).nice();
    xAxisGroup.transition().duration(1000)
      .call(d3.axisBottom(xScale));

      xAxisGroup.selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-45)")  // Rotate the labels by -45 degrees
      .attr("dx", -10)  // Adjust the horizontal position (optional, tweak if needed)
      .attr("dy", 10);  // Adjust the vertical position (optional, tweak if needed)
  
    // Remove any existing x-axis label and add a new one
    svg.selectAll(".x-axis-label").remove();
    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text(feature);

    // Bind the data to circle elements
    const circles = svg.selectAll("circle").data(data);

    // For new elements, append circles and set their attributes
    circles.enter()
      .append("circle")
      .attr("cx", d => xScale(d[feature]))
      .attr("cy", d => yScale(d.Price))
      .attr("r", 4)
      .attr("fill", "teal")
      .merge(circles)   // Merge to update both new and existing circles
      .transition().duration(1000)
      .attr("cx", d => xScale(d[feature]))
      .attr("cy", d => yScale(d.Price));

    // Remove circles that are no longer needed
    circles.exit().remove();
  }

  // Initialize the scatter plot with "Mileage" as the default feature
  updateScatterPlot("Mileage");

  // Listen for changes on the dropdown to update the scatter plot
  d3.select("#featureSelect").on("change", function() {
    const selectedFeature = d3.select(this).property("value");
    updateScatterPlot(selectedFeature);
  });
})
.catch(error => console.error("Error loading data:", error));




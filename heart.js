const margin = {top: 50, right: 50, bottom: 150, left: 50};
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#heatmap")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

const legendWidth = 300;

const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
  .domain([0, 1]);

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(function(data) {
  
  const dataset = data.monthlyVariance;
  
  const years = Array.from(new Set(dataset.map(d => d.year)));
  const months = Array.from(new Set(dataset.map(d => d.month)));

  const xScale = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleBand()
    .domain(months) // months directly used as the domain
    .range([0, height])
    .padding(0.1);

  const cellWidth = xScale.bandwidth();
  const cellHeight = yScale.bandwidth();

  const yearScale = d3.scaleLinear()
    .domain([d3.min(years), d3.max(years)])
    .range([0, legendWidth]);

  svg.selectAll(".cell")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.month))
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => colorScale(d.variance))
    .attr("data-month", d => d.month - 1)  // month is 1-12, adjust for 0-indexing
    .attr("data-year", d => d.year)
    .attr("data-temp", d => data.baseTemperature + d.variance)
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("visibility", "visible");
      tooltip.html(`${d3.timeFormat("%B")(new Date(d.year, d.month - 1))} ${d.year} <br>Temperature: ${(data.baseTemperature + d.variance).toFixed(2)}°C`)
        .attr("data-year", d.year)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function() {
      tooltip.transition().duration(200).style("visibility", "hidden");
    });

  // Fix y-axis to map months correctly
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const xAxis = d3.axisBottom(xScale)
    .tickValues([1754, 1800, 1850, 1900, 1950, 2000, 2015])
    .tickFormat(d3.format("d"));
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => monthNames[d - 1]); // Adjust for 0-indexing

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .call(yAxis);

  // Leyenda
  const legend = d3.select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", 20);

  const legendScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([0, 1]);

  legend.selectAll("rect")
    .data(d3.range(0, 1, 0.1))
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (legendWidth / 10))
    .attr("y", 0)
    .attr("width", legendWidth / 10)
    .attr("height", 20)
    .attr("fill", d => legendScale(d));

});

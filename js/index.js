function convertTicks(d) {
  console.log(d);
  return "";
}

function showTip(d, months, baseTemp) {
  var html = d.year + " - " + months[d.month - 1] + "<br/>";
  html += "Temperature: " + (baseTemp + d.variance).toFixed(3) + " &degC<br/>";
  html += "Variance: " + d.variance + " &degC<br/>";

  d3.select("#tooltip").style("left", (d3.event.pageX + 5) + "px").style("top", (d3.event.pageY - 28) + "px").html(html).transition().duration(200).style("opacity", .9);
}

function hideTip(d) {
  d3.select("#tooltip").transition().duration(500).style("opacity", 0);
}

function docReady() {
  var minX = 0;
  var maxX = 0;
  var maxY = 0;

  var colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var margin = {top: 20, right: 90, bottom: 30, left: 50};
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#canvas")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")");

  d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json", function(error, json) {
    if (error) throw error;

    var baseTemp = json.baseTemperature;
    var data = json.monthlyVariance;

    var variance = data.map(function(obj) { return obj.variance; });
  
    minX = d3.min(data, function(d) { return d.year; });
    maxX = d3.max(data, function(d) { return d.year; });
    maxY = d3.max(data, function(d) { return d.month; });

    var gridWidth = width / (maxX - minX);
    var gridHeight = height / maxY;

  // Compute the scale domains.
    var x = d3.scaleLinear().domain([minX, maxX]).range([ 0, width ]);    
    var y = d3.scaleLinear().domain([maxY + 1, 1]).range([ height, 0 ]);
    var z = d3.scaleQuantile().domain([d3.extent(variance)[0], d3.extent(variance)[1]]).range(colors);

    // Display the tiles for each non-zero bucket.
    svg.selectAll(".tile")
        .data(data)
      .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", function(d) { return y(d.month); })
        .attr("width", gridWidth)
        .attr("height",  gridHeight)
        .style("fill", function(d) { return z(d.variance); })
        .on("mouseover", function(d) {showTip(d, months, baseTemp);})
        .on("mouseout", function(d) {hideTip(d);});

    // Add a legend for the color values.


    // draw the x axis
    var xAxis = d3.axisBottom(x);

    svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis')
    .call(xAxis);

    // draw the y axis
    var yAxis = d3.axisLeft(y).tickFormat(function(d) {return "";});

    svg.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis')
    .call(yAxis);

    // add month labels
    for (let i = 0; i < 12; i++) {
    svg.append("text").text(months[i])
      .attr('transform', 'translate(-5, ' + (i * gridHeight + gridHeight/1.75) + ')')
      .style("font-size", "12px")
      .style("text-anchor", "end");

    }



    var legend = svg.selectAll(".legend")
      .data([0].concat(z.quantiles()), function(d) {
        return d;
      });

    legend.enter()
      .append("g")
      .attr("class", "legend");
    legend.append("rect")
      .attr("x", function(d, i) {
        return legendWidth * i;
      })
      .attr("y", height + margin.bottom / 3 + 15)
      .attr("width", 600)
      .attr("height", gridHeight / 2)
      .style("fill", function(d, i) {
        return colors[i];
      });
    legend.append("text")
      .text(function(d) {
        if (d === 0) {
          return "< " + Math.round(colorScale.quantiles()[0] * 10) / 10;
        } else {
          return "≥ " + Math.round(d * 10) / 10;
        }
      })
      .attr("x", function(d, i) {
        return legendWidth * i + 10;
      })
      .attr("y", height + margin.bottom / 2 + 15)
      .style("text-anchor", "front");

  });
};

/* global d3, c3 */
"use strict";

var slide8svg;
var slide8xAxis;
var slide8x;
var slide8Sorted = true;
var gauge;

var data = [
  {x : 8, y : 34},
  {x : 9, y : 44},
  {x : 10, y : 2},
  {x : 11, y : 14},
  {x : 12, y : 18},
  {x : 13, y : 6},
  {x : 14, y : 2},
  {x : 15, y : 7},
  {x : 16, y : 4},
  {x : 17, y : 2},
  {x : 18, y : 13},
  {x : 19, y : 5},
  {x : 20, y : 16},
  {x : 21, y : 21},
  {x : 22, y : 17}
];
// Define width/height/margins
var margin =
        {
          top : 10,
          right : 10,
          bottom : 20,
          left : 30
        },
    width = 550 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

function draw() {
  // Define the scales (x,y)
  var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], 0.1, 1);
  slide8x = x;
  var y = d3.scale.linear().range([ height, 0 ]);

  // Define axes drawers
  var xAxis = d3.svg.axis().scale(x).orient("bottom");
  slide8xAxis = xAxis;
  var yAxis = d3.svg.axis().scale(y).orient("left");

  // Create the main svg group element
  var svg = d3.select("#chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");
  slide8svg = svg;

  // Paste the data as the domain for the scales
  x.domain(data.map(function(d) { return d.x; }));
  y.domain([ 0, d3.max(data, function(d) { return d.y; }) ]);

  // Apply the axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Registrants");

  // Draw the bars
  svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.x); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); })
      .on("mouseover",
          function(d) {
            d3.select("#tooltip")
                .text(d.x + ", " + d.y)
                .style("left", (parseInt(d3.select(this).attr("x")) +
                                parseInt(d3.select(this).attr("width")) / 2) +
                                   "px")
                .style("top", (parseInt(d3.select(this).attr("y")) +
                               (parseInt(d3.select(this).attr("height")) >
                                        (height - 40)
                                    ? 30
                                    : -15)) +
                                  "px")
                .classed("visible", true);
          })
      .on("mouseleave", function(d) {
        d3.select("#tooltip").classed("visible", false);
      });
}

function changeSort() {

  // Sort and copy the array
  var x0 =
      slide8x.domain(data.sort(slide8Sorted
                                   ? function(a, b) { return b.y - a.y; }
                                   : function(a, b) {
                                     return d3.ascending(a.x, b.x);
                                   }).map(function(d) { return d.x; })).copy();

  // Define the transitions
  var transition = slide8svg.transition().duration(750),
      delay = function(d, i) { return i * 50; };

  // Move the bars
  transition.selectAll(".bar").delay(delay).attr(
      "x", function(d) { return x0(d.x); });

  // Move the labels
  transition.select(".x.axis").call(slide8xAxis).selectAll("g").delay(delay);
  slide8Sorted = !slide8Sorted;
}
function changeValues() {
  data = data.map(function(d) {
    return {
      x : d.x, // Number.parseInt(Math.random() * width),
      y : Number.parseInt(Math.random() * height)
    };
  }).sort(function(a, b) { return d3.ascending(a.x, b.x); });
  var transition = slide8svg.transition().duration(750);
  d3.selectAll(".bar").data(function(d, i) { return data[i]; });
  transition.selectAll(".bar").attr("y", function(d, i) {
    return height - data[i].y;
  }).attr("height", function(d, i) { return data[i].y; });
  slide8Sorted = true;
  gauge.load({columns : [[ 'data', parseInt(Math.random() * 300) ]]});
}
draw();
document.getElementById("random").onclick = changeValues;
document.getElementById("sort").onclick = changeSort;

function drawGauge() {
  gauge = c3.generate({
    bindto : "#gauge",
    data : {columns : [[ 'data', 91.4 ]], type : 'gauge'},
    gauge : {
      label : {format : function(value, ratio) { return value; }, show : true},
      min : 0,
      max : 300,
      units : ' km',
      witdth : 50
    },
    color : {
      pattern : [
        '#FF0000',
        '#F97600',
        '#F6C600',
        '#60B044'
      ], // the three color levels for the percentage values.
      threshold : {values : [ 30, 60, 90, 100 ], unit : 'value'}
    },
    size : {height : 180}
  });
}
drawGauge();

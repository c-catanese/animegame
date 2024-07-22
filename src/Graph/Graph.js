import React, {useEffect, useRef} from 'react';
import styles from "./Graph.module.scss"
import * as d3 from 'd3';


function Graph({ userRecord, showScoreboard}){

  const chartRef = useRef(null);

  useEffect(() => {
    // Remove any existing SVG when the effect runs
    d3.select(chartRef.current).selectAll("svg").remove();
  
    // Set up the dimensions of the chart
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 300 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    // Create the SVG container for the chart
    const svg = d3.select(chartRef.current).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    const maxValue = d3.max(Object.values(userRecord));
    const keys = Object.keys(userRecord).reverse();
  
    // Set the x and y scales
    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, maxValue]);
  
    const y = d3.scaleBand()
      .range([height, 0])
      .padding(0.1)
      .domain(keys);
  
    // Create the x and y axes
    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickSize(0) // Hide the ticks
      .tickPadding(10);
  
    const yAxis = d3.axisLeft(y)
      .tickSize(0)
      .tickPadding(10);
  
    // Add vertical gridlines
    svg.selectAll("line.vertical-grid")
      .data(x.ticks(5))
      .enter()
      .append("line")
      .attr("class", "vertical-grid")
      .attr("x1", d => x(d))
      .attr("y1", 0)
      .attr("x2", d => x(d))
      .attr("y2", height)
      .style("stroke", "black")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "3 3");
  
    // Create the bars for the chart
    svg.selectAll(".bar")
      .data(keys)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", d => x(userRecord[d]))
      .attr('fill', 'black');
  
    // Add the y axis to the chart
    svg.append("g")
      .attr("class", "y axis")
      .style("font-size", "8px")
      .call(yAxis)
      .selectAll('path')
      .style('stroke-width', '1.75px')
      .style('stroke', 'black');
  
      svg.selectAll(".y.axis .tick text")
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style('fill', 'black')      .text(d => d.toUpperCase());
  
    // Add the x axis to the bottom of the chart but hide its labels and ticks
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")") // Move the x-axis to the bottom
      .style("font-size", "10px")
      .call(xAxis)
      .selectAll("text")
      .style("display", "none") // Hide the text labels on the x-axis

      svg.selectAll(".x.axis path")
      .style("stroke", "black") // Make the x-axis line black
      .style("stroke-width", "1.75px"); // Adjust the stroke width

    svg.selectAll(".x.axis .tick line")
      .style("stroke", "black") // Make the tick lines black
      .style("stroke-width", "1.75px"); // Adjust the stroke width

  
    // Add labels to the end of each bar
    svg.selectAll(".label")
      .data(keys)
      .enter().append("text")
      .attr("x", d => x(userRecord[d]) + 5)
      .attr("y", d => y(d) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style('fill', 'black')
      .text(d => userRecord[d]);
  
    // Cleanup function to remove the chart when the component unmounts
    return () => {
      d3.select(chartRef.current).selectAll("*").remove();
    };
  }, [userRecord]);
  
  function getPercentage(userRecord){
    const percentage = ((userRecord[1] + userRecord[2] + userRecord[3])/(userRecord[1] + userRecord[2] + userRecord[3] + userRecord['x'])*100).toFixed(1)
    return 'Stats: ' + (userRecord[1] + userRecord[2] + userRecord[3])+ '/' +(userRecord[1] + userRecord[2] + userRecord[3] + userRecord['x']) + " (" + percentage + "%)"
  }
  return (
    <div className={styles.blurBackground}>
      <div className={styles.container}>
        <button className={styles.closeButton} onClick={showScoreboard}>X</button>
        <h3>Your Scores</h3>
        <div id="scores" ref={chartRef}></div>
        {getPercentage(userRecord)}
      </div>
    </div>
  )
}

export default Graph
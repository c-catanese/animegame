import React, { useEffect, useRef } from 'react';
import styles from "./Graph.module.scss"
import * as d3 from 'd3';

const TEXT_COLOR = '#f0e6d3';
const BAR_COLOR = '#f4a7b9';
const GRID_COLOR = 'rgba(255, 255, 255, 0.1)';
const AXIS_COLOR = 'rgba(255, 255, 255, 0.2)';

function Graph({ userRecord, showScoreboard }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') showScoreboard(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showScoreboard]);

  useEffect(() => {
    const currentChartRef = chartRef.current;
    d3.select(currentChartRef).selectAll("svg").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 300 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(currentChartRef).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const maxValue = d3.max(Object.values(userRecord));
    const keys = Object.keys(userRecord).reverse();

    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, maxValue]);

    const y = d3.scaleBand()
      .range([height, 0])
      .padding(0.15)
      .domain(keys);

    const xAxis = d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10);
    const yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

    svg.selectAll("line.vertical-grid")
      .data(x.ticks(5))
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("y1", 0)
      .attr("x2", d => x(d))
      .attr("y2", height)
      .style("stroke", GRID_COLOR)
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "3 3");

    svg.selectAll(".bar")
      .data(keys)
      .enter().append("rect")
      .attr("y", d => y(d))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", d => x(userRecord[d]))
      .attr('fill', BAR_COLOR)
      .attr('rx', 4);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .selectAll('path')
      .style('stroke-width', '1px')
      .style('stroke', AXIS_COLOR);

    svg.selectAll(".y.axis .tick text")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style('fill', TEXT_COLOR)
      .text(d => d.toUpperCase());

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("display", "none");

    svg.selectAll(".x.axis path")
      .style("stroke", AXIS_COLOR)
      .style("stroke-width", "1px");

    svg.selectAll(".x.axis .tick line")
      .style("stroke", AXIS_COLOR);

    svg.selectAll(".label")
      .data(keys)
      .enter().append("text")
      .attr("x", d => x(userRecord[d]) + 5)
      .attr("y", d => y(d) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style('fill', TEXT_COLOR)
      .text(d => userRecord[d]);

    return () => {
      d3.select(currentChartRef).selectAll("*").remove();
    };
  }, [userRecord]);

  function getPercentage(record) {
    const wins = record[1] + record[2] + record[3];
    const total = wins + record['x'];
    const percentage = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
    return `Stats: ${wins}/${total} (${percentage}%)`;
  }

  return (
    <div className={styles.blurBackground} onClick={showScoreboard}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} aria-label="close scores" onClick={showScoreboard}>X</button>
        <h3 className={styles.title}>Your Scores</h3>
        <div id="scores" ref={chartRef}></div>
        <p className={styles.stats}>{getPercentage(userRecord)}</p>
      </div>
    </div>
  )
}

export default Graph

/** File: svg-msc.js
 * Core
 *
 * Authors:
 *   - jmgoncalves
 *
 * Copyright:
 *   (c) 2014 jmgoncalves All rights reserved.
 */
'use strict';

/** Class: SvgMsc
 * SvgMsc class
 * TODO
 *
 * Parameters:
 *   (Core) self - itself
 *   (d3) d3 - d3
 */
var SvgMsc = (function(self, d3) {

self.draw = function (svgId, captureJson, width, message_ystart, message_ystep) {

  // defaults
  if (width === undefined)
    width = 1600;
  if (message_ystart === undefined)
    message_ystart = 100;
  if (message_ystep === undefined)
    message_ystep = 30;

  // add svg
  var svg = d3.select("svg#"+svgId)
      .attr("width", width);

  // arrows
  svg.append("marker")
      .attr("id", "leftarrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 0)
      .attr("refY", 5)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M 10 0 L 0 5 L 10 10 z");

  svg.append("marker")
      .attr("id", "rightarrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");

  d3.json(captureJson, function(error, capture) {
    if (capture === undefined)
      console.log(error);

    // height calculation for number of messages responsiveness
    var height = capture.messages.length*message_ystep+message_ystart*2
    svg.attr("height", height);

    // lifelineSeparation calculation for width responsiveness
    var numLines = 0;
    for (var i=0; i<capture.entities.length; i++) {
      numLines++; // an entity with a lifeline takes 1 space unit
      numLines = numLines + (capture.entities[i].ipAddresses.length-1)/2; // additional lifelines in an entity only take half space unit
    }
    var lifelineSeparation = Math.floor(width/numLines)

    // helper data structures
    var lifelineCoords = 0;
    var lifelineCoordsNamedArray = {};

    // populate entities
    var entity = svg.selectAll(".entity")
        .data(capture.entities)
      .enter().append("g")
        .attr("class", "entity")
        .attr("transform", function(d) { 
          var retval = lifelineCoords;
          for (var i=0; i<d.ipAddresses.length; i++) {
            lifelineCoordsNamedArray[d.ipAddresses[i]] = lifelineCoords+i*lifelineSeparation/2;
          }
          lifelineCoords = lifelineCoords + (d.ipAddresses.length-1)*lifelineSeparation/2 + lifelineSeparation;
          return "translate("+retval+" 0)"; });

    entity.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("width", function(d) { return (d.ipAddresses.length*lifelineSeparation/2); })
        .attr("height", 50);

    entity.append("text")
        .attr("x", function(d) { return (d.ipAddresses.length*lifelineSeparation)/4; })
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; });

    // populate entity lifelines
    var lifeline = entity.selectAll(".lifeline")
        .data(function(d) { return d.ipAddresses; })
      .enter().append("g")
        .attr("class", "lifeline")
        .attr("transform", function(d,i) { return "translate("+(i*lifelineSeparation/2+lifelineSeparation/4)+" 50)"; });

    lifeline.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    lifeline.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black")
      .attr("stroke-width", "1")
      .attr("stroke-dasharray", "5,5");

    // populate messages
    var message = svg.selectAll(".message")
        .data(capture.messages)
      .enter().append("g")
        .attr("class", "message")
        .attr("transform", function(d) { 
          var startx = Math.min(lifelineCoordsNamedArray[d.source],lifelineCoordsNamedArray[d.destination])+lifelineSeparation/4;
          return "translate("+startx+" "+(message_ystart+d.id*message_ystep)+")"; });

    message.append("line")
      .attr("x1", 0)
      .attr("x2", function(d) { return Math.abs(lifelineCoordsNamedArray[d.source]-lifelineCoordsNamedArray[d.destination]); })
      .attr("stroke", "black")
      .attr("stroke-width", "2")
      .attr("marker-start", function(d) {
        if (lifelineCoordsNamedArray[d.source]>lifelineCoordsNamedArray[d.destination])
          return "url(#leftarrow)";
        return "";})
      .attr("marker-end", function(d) {
        if (lifelineCoordsNamedArray[d.source]<lifelineCoordsNamedArray[d.destination])
          return "url(#rightarrow)";
        return "";});

    message.append("rect")
        .attr("x", 15)
        .attr("y", -13)
        .attr("fill", "white")
        .attr("stroke", "none")
        .attr("width", function(d) { return (Math.abs(lifelineCoordsNamedArray[d.source]-lifelineCoordsNamedArray[d.destination]))-30; })
        .attr("height", 12);

    message.append("text")
        .attr("x", function(d) { return Math.abs((lifelineCoordsNamedArray[d.source]-lifelineCoordsNamedArray[d.destination]))/2; })
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text(function(d) { return d.protocol+" "+d.value; });
  });
}

return self;
}(SvgMsc || {}, d3));
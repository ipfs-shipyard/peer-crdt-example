'use strict'

const d3 = require('d3')
const crdt = require('./crdt')

;(async function () {
  const drawing = await crdt('rga', 'peer-crdt-example-flipchart')

  // ------ D3: translate line point into D3 render path
  var renderPath = d3.line()
    .x(function (d) { return d[0] })
    .y(function (d) { return d[1] })
    .curve(d3.curveNatural)

  // ------ D3 Flipchart drawing initialization ------
  var svg = d3.select('#flipchart')

  // ------ CRDT and D3: Draw a new line ------
  function drawLine (points) {
    console.log('draw line', points.value())
    var line = svg.append('path')
      .datum(points.value())
      .attr('class', 'line')

    line.attr('d', renderPath)

    // Observe changes that happen on this line
    points.on('change', lineChanged)

    function lineChanged (event) {
      console.log('line changed', event)
      // we only implement insert events that are appended to the end of the array
      if (event.type === 'insert') {
        line.datum().push(event.value)
        line.attr('d', renderPath)
      }
    }
  }

  // ------ CRDT: listen for new and removed lines ------
  drawing.on('change', drawingChanged)

  function drawingChanged (event) {
    console.log('drawing changed', event)
    if (event.type === 'insert') {
      drawLine(event.value)
    } else {
      // just remove all elements (thats what we do anyway)
      svg.selectAll('path').remove()
    }
  }

  // ------ CRDT: draw all existing content ------
  drawing.value().forEach(drawLine)

  // ------ User interaction: handle drag events ------
  svg.call(d3.drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded))

  var sharedLine = null

  function dragStarted () {
    sharedLine = drawing.createForEmbed('rga')
    drawing.push(sharedLine)
  }

  // After one dragged event is recognized, we ignore them for 33ms.
  var ignoreDrag = null
  function dragged () {
    if (sharedLine && !ignoreDrag) {
      ignoreDrag = window.setTimeout(function () {
        ignoreDrag = null
      }, 33)
      const mouse = d3.mouse(this)
      sharedLine.push(mouse)
    }
  }

  function dragEnded () {
    sharedLine = null
    window.clearTimeout(ignoreDrag)
    ignoreDrag = null
  }

  // ------ User interaction: Clear all ------

  document.getElementById('clear').onclick = clickedClear

  function clickedClear () {
    const length = drawing.value().length
    for (let i = 0; i < length; i++) {
      drawing.removeAt(i)
    }
  }
})()

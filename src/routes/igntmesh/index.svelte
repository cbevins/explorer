<script>
	import { onMount } from 'svelte'
  import { FireMeshEllipse } from '../../models/FireMesh/index.js'
  import { GeoBounds } from '../../models/Geo/index.js'
  import SimpleSlider from '../../components/SimpleSlider.svelte'
  import SimpleTable from '../../components/SimpleTable.svelte'

  // Landscape GeoBounds
  let west = -100
  let east = 200
  let south = -100
  let north = 100
  let spacing = 1
  let bounds = new GeoBounds(west, north, east, south, spacing, spacing)
  let width = bounds.width()
  let height = bounds.height()
  let midx = west + (east - west) / 2
  let midy = south + (north - south) / 2

  // let headRos = 93.3012701892219
  let ellipseLength = 100
  let ellipseWidth = 50
  let ellipseHeadDegrees = 90
  let timeSinceIgnition = 1


  let fe // fire ignition ellipse
  let draw = null // SVG element
  let sizeStats = [] // size stats array

  $: {
    ellipseWidth = Math.min(ellipseWidth, ellipseLength)
    fe = new FireMeshEllipse(ellipseLength, ellipseWidth, ellipseHeadDegrees,
      timeSinceIgnition, spacing)
    sizeStats = getSizeStats()
    if (draw) drawLandscape(midx, midy)
  }

  function drawLandscape () {
    draw.rect(width, height).move(west, vbY(north)).attr({ fill: 'green' })
    const grid = { color: 'black', width: 1 }
    draw.line(west, vbY(midy), east, vbY(midy)).stroke(grid)
    draw.line(midx, vbY(north), midx, vbY(south)).stroke(grid)
    drawFireMeshAt(midx, midy)
  }

  function drawFireMeshAt (x = 0, y = 0) {
    const burned = { color: 'red', width: 1 }
    fe.hlines().forEach(([hy, x1, x2]) => { draw.line(x1+x, vbY(hy+y), x2+x, vbY(hy+y)).stroke(burned) })
    fe.vlines().forEach(([vx, y1, y2]) => { draw.line(vx+x, vbY(y1+y), vx+x, vbY(y2+y)).stroke(burned) })
    draw.circle(2).attr({fill: 'yellow', cx: fe.hx()+x, cy: vbY(fe.hy()+y)})
    draw.circle(2).attr({fill: 'yellow', cx: fe.bx()+x, cy: vbY(fe.by()+y)})
    draw.circle(2).attr({fill: 'yellow', cx: x, cy: vbY(y)})
  }

  // Gets canvas and context once they are mounted
	onMount(() => {
    draw = SVG().addTo('#svg3Canvas').size(400, 400)
    draw.viewbox(west, south, width, height)
    drawLandscape()
  })

  function getSizeStats () {
    const geoArea = fe.area()
    const estArea = fe.estArea()
    const pctdiff = 100 * (estArea - geoArea) / geoArea
    return [
      ['Ellipse Area', geoArea.toFixed(0)],
      ['FireMesh Area', estArea.toFixed(0)],
      ['Percent Diff', pctdiff.toFixed(2)],
      ['Ellipse Perim', fe.perimeter().toFixed(0)],
      ['Ignition Pts', 2 * fe.hlines().length]
    ]
  }

  // Converts geographic y-coordinate values, which increase from south-to-north,
  // into SVG veiwBox y-coordinate values, which increase north-to-south
  function vbY (y) { return (north - y) + south }
</script>

<svelte:head>
	<title>IgntMesh</title>
</svelte:head>

<div id='top'></div>
<h5 class='mb-3'>FireMeshIgnitionEllipse Tinker Toy</h5>
<div class='row'>
  <div class='col'>
    <SimpleSlider id='degreesSlider' label='Heading' bind:value={ellipseHeadDegrees} min=0 max=359/>
    <SimpleSlider id='lengthSlider' label='Length' bind:value={ellipseLength} min=1 max=100/>
    <SimpleSlider id='widthSlider' label='Width' bind:value={ellipseWidth} min=1 max=50/>
    <SimpleSlider id='spacingSlider' label='Spacing' bind:value={spacing} min=1 max=10/>
    <SimpleTable id='statsTable' title='Stats' opened='true' data={sizeStats} />
  </div>
  <div class='col-8' id='svg3Canvas'></div>
</div>

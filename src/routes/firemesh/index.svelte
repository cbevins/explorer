<script>
	import { onMount } from 'svelte'
  import { FireMesh, FireMeshBehaviorProviderEllipse, FireMeshInputProviderConstant,
    FireMeshIgnitionEllipseProvider } from '../../models/FireMesh/index.js'
  import { GeoBounds } from '../../models/Geo/index.js'
  import SimpleSlider from '../../components/SimpleSlider.svelte'
  import SimpleTable from '../../components/SimpleTable.svelte'

  // FireMesh data providers
  let fireBehaviorProvider = new FireMeshBehaviorProviderEllipse()
  let fireInputProvider = new FireMeshInputProviderConstant()
  let ignitionEllipseProvider = new FireMeshIgnitionEllipseProvider(fireInputProvider, fireBehaviorProvider)

  // FireMesh landscape GeoBounds
  let west = 1450
  let east = 2000
  let south = 4000
  let north = 4550
  let spacing = 5
  let bounds = new GeoBounds(west, north, east, south, spacing, spacing)
  let width = bounds.width()
  let height = bounds.height()
  let midx = west + (east - west) / 2
  let midy = south + (north - south) / 2
  let mesh = null // new FireMesh(bounds, ignitionEllipseProvider)

  // Add an ignition point to kick off the fire
  let duration = 2
  let ignX = 1500
  let ignY = 4500

  let image = null // SVG element
  let horzArea = 0 // burned area as estimated each burn period by drawFireMeshHorz()
  let horzLines = 0 // lines with burned segments as estimated each burn period by drawFireMeshHorz()
  let vertLines = 0
  let burnPeriod = 0
  let sizeStats = []
  let splitLines = []
  let horzIgnPts = []
  let vertArea = 0
  let vertIgnPts = []

  // for tracking a specific line index
  let trackIdx = -1 // set to -1 for no tracking

  // Draws the background landscape
  function drawGridLines () {
    const grid = { color: 'black', width: 1 }
    image.line(west, vbY(midy), east, vbY(midy)).stroke(grid)
    image.line(midx, vbY(north), midx, vbY(south)).stroke(grid)
    image.circle(4).attr({fill: 'yellow', cx: ignX, cy: vbY(ignY)})
  }

  function drawImage () {
    drawLandscape()
    //drawFireMeshHorz()
    drawFireMeshVert()
    drawGridLines()
  }

  // Draws the background landscape
  function drawLandscape () {
    image.rect(width, height).move(west, vbY(north)).attr({ fill: 'green' })
  }

  function drawFireMeshHorz () {
    splitLines = []
    horzArea = 0
    horzLines = 0
    vertArea = 0
    vertLines = 0
    const burned = { color: 'red', width: 1 }
    const split = { color: 'blue', width: 1 }
    mesh.horzArray().forEach((line, idx) => {
      const y = line.anchor()
      const nsegs = line.segments().length
      if (nsegs) horzLines++
      if (nsegs > 1) splitLines.push(idx)
      const style = (nsegs > 1) ? split : burned
      line.segments().forEach(segment => {
        image.line(segment.begins(), vbY(y), segment.ends(), vbY(y)).stroke(style)
        horzArea += segment.length()
      })
    })
    // Track line reporting ...
    // if (trackIdx >= 0) {
    //   let line = mesh.horzLine(trackIdx)
    //   let str = `Line ${trackIdx} at Y ${line.anchor()} Period ${burnPeriod} has ${line.segments().length} segments:`
    //   line.segments().forEach(segment => {
    //     str += `[${segment.begins().toFixed(2)}, ${segment.ends().toFixed(2)}] `
    //   })
    //   console.log(str)
    // }
  }

  function drawFireMeshVert () {
    splitLines = []
    vertArea = 0
    vertLines = 0
    const burned = { color: 'red', width: 1 }
    const split = { color: 'blue', width: 1 }
    mesh.vertArray().forEach((line, idx) => {
      const x = line.anchor()
      const nsegs = line.segments().length
      if (nsegs) vertLines++
      if (nsegs > 1) splitLines.push(idx)
      const style = (nsegs > 1) ? split : burned
      line.segments().forEach(segment => {
        image.line(x, vbY(segment.begins()), x, vbY(segment.ends())).stroke(style)
        vertArea += segment.length()
      })
    })
  }

  // Gets canvas and context once they are mounted
	onMount(() => {
    image = SVG().addTo('#svg3Canvas').size(400, 400)
    image.viewbox(west, south, width, height)
    reset()
  })

  function reset () {
    mesh = new FireMesh(bounds, ignitionEllipseProvider)
    mesh.igniteAt(ignX, ignY)
    horzArea = 0
    vertArea = 0
    burnPeriod = 0
    horzLines = 0 // horizontal lines with burned segments
    vertLines = 0 // vertical lines with burned segments
    sizeStats = []
    splitLines = []
    drawImage()
  }

  function step () {
    burnPeriod++
    mesh.burnForPeriod(duration, trackIdx)
    horzIgnPts = mesh.horzIgnitionPoints()
    vertIgnPts = mesh.vertIgnitionPoints()
    drawImage()
    sizeStats = [
      ['Period', burnPeriod, burnPeriod],
      ['', 'Horz', 'Vert'],
      ['Ign Pts', horzIgnPts.length, vertIgnPts.length],
      ['Burn Lines', horzLines, vertLines],
      ['Area ft2', horzArea.toFixed(0), vertArea.toFixed(0)],
      ['Geo Warn', mesh.warning() ? 'WARN' : 'OK', '']
    ]
    splitLines.forEach(idx => {
      const line = mesh.horzLine(idx)
      sizeStats.push([`Line ${idx}`, line.segments().length])
    })
  }

  // Converts geographic y-coordinate values, which increase from south-to-north,
  // into SVG veiwBox y-coordinate values, which increase north-to-south
  function vbY (y) { return (north - y) + south }
</script>

<svelte:head>
	<title>FireMesh</title>
</svelte:head>

<div id='top'></div>
<h5 class='mb-3'>FireMesh Tinker Toy</h5>
<div class='row'>
  <div class="col">
    <div class='row'>
      <button class='btn-primary mb-3' on:click={step}>Step</button>
      <button class='btn-primary mb-3' on:click={reset}>Reset</button>
    </div>
    <div class='row'>
      <SimpleTable id='statsTable' title='Stats' opened='true' data={sizeStats} />
      </div>
  </div>
  <div class='col-8' id='svg3Canvas'></div>
</div>

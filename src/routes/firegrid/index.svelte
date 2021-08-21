<script>
	import { onMount } from 'svelte'
  import { FireStatus, GeoFireGrid } from '../../models/GeoFire'
  import { FireInputProviderMock } from './FireInputProviderMock.js'
  import SimpleTable from '../../components/SimpleTable.svelte'

  // Create a GeoFireGrid instance 1000 ft west-to-east and 1000 ft north-to-south with 10-ft spacing
  let west = 1000
  let east = 2000
  let north = 5000
  let south = 4000
  let xdist = 4
  let ydist = 4
  let width = east - west
  let height = north - south

  // Use a fire input provider that yields a spatially and temporally constant set of inputs
  const fireInputProvider = new FireInputProviderMock()
  const fireGrid = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)

  // Ignite a single point at time 0
  let ignX = 1200
  let ignY = 4800
  let ignT = 0

  // Burning period duration and maximum burning periods
  let periodDuration = 2 // minutes
  let periodMax = 24 * 60 // 24 hours
  let fireLength, fireWidth, fireHeadRos, fireBackRos, fireLwr, fireHeading, elapsedTime = 0
  let fireCx, fireCy, fireHx, fireHy, fireBx, fireBy, fireArea, firePerimeter

  // Burning stats
  let burnSummary = []
  let ellipseSummary = []
  let running = true

  // Here are some named patterns of unburnable points: TRUE implements it, FALSE ignores it
  let pattern = {
    shortCol: false,
    shortRow: false,
    colHole: false,
    roads: false
  }

  // These properties are set by onMount():
	let canvas // reference to the on-screen HTML <canvas> element
  let ctx // reference to the canvas 2d context
  let frame // id of the current animation frame

  // Runs GeoFireGrid simulation for 1 burning period
  function burn () {
    fireGrid.burnForPeriod(periodDuration)
    drawFireGrid()
    drawFireEllipse()
  }

  function loop(t) {
    frame = requestAnimationFrame(loop)
    if (fireGrid.period().number() >= periodMax) cancelAnimationFrame(frame)
    burn()
  }

  // Draws the free-burning geometrical ellipse based on FireEllipse length and width
  function drawFireEllipse () {
    // THIS ALL ASSUMES *NO* SPATIAL AND TEMPORALY VARIABILITY
    const fe = fireGrid.fireEllipse()
    elapsedTime += periodDuration
    fireHeadRos = fe.headRate()
    fireBackRos = fe.backRate()
    fireLwr = fe.lwr()
    fireLength = (fireHeadRos + fireBackRos) * fireGrid.period().ends()
    fireWidth = fireLength / fireLwr
    fireHeading = fe.headDegrees()
    const period = fireGrid.period().number()
    fireCx = fe.cx() * period
    fireCy = fe.cy() * period
    fireHx = fe.hx() * period
    fireHy = fe.hy() * period
    fireBx = fe.bx() * period
    fireBy = fe.by() * period
    fireArea = Math.PI * fireLength * fireLength / (4 * fireLwr)
    firePerimeter = perimeter(fireLength, fireWidth)

    // Free burning geometrical ellipse
    ctx.beginPath()
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 5
    const cx = ignX - west + fireCx // center x: ignition easting plus center easting
    const cy = north - ignY - fireCy // center y: ignition northing less center northing
    const rx = fireLength / 2
    const ry = fireWidth / 2
    const rad = ((fireHeading + 270) % 360) * Math.PI / 180
    ctx.ellipse(cx, cy, rx, ry, rad, 0, 2 * Math.PI)
    ctx.stroke()

    drawFirePointBack()
    drawFirePointHead()
    drawFirePointIgnition()


    const [points, perim] = fireGrid.gridStatusAt(fireGrid.period().ends())
    const faces = perim.faces // faces at start of most recent burning period
    console.log(faces)

    const estPerim = xdist * (faces[1] + 1.414 * faces[2] + (1 + 1.414) * faces[3] + 4 * faces[4])
    const burnedCells = faces[0] + faces[1] + faces[2] + faces[3] + faces[4]
    const estArea = burnedCells * xdist * ydist
    ellipseSummary = [
      ['Elapsed Time', elapsedTime.toFixed(0)],
      ['Geometric Area', fireArea.toFixed(0)],
      ['Expect Burned Cells', (fireArea/xdist/ydist).toFixed(0)],
      ['Actual Burned Cells', (burnedCells).toFixed(0)],
      ['Estimated Area', (estArea).toFixed(0)],
      ['Geometric Perimeter', firePerimeter.toFixed(0)],
      ['Estimated Perimeter', (estPerim).toFixed(0)],
      // ['Head RoS', fireHeadRos.toFixed(2)],
      // ['Back RoS', fireBackRos.toFixed(2)],
      // ['Fire Length', fireLength.toFixed(0)],
      // ['Fire Width', fireWidth.toFixed(0)],
      // ['Fire Heading', fireHeading.toFixed(0)],
    // ['Fire Center X', fireCx.toFixed(2)],
    // ['Fire Center Y', fireCy.toFixed(2)],
    // ['Fire Head X', fireHx.toFixed(2)],
    // ['Fire Head Y', fireHy.toFixed(2)],
    // ['Fire Back X', fireBx.toFixed(2)],
    // ['Fire Back Y', fireBy.toFixed(2)]
    ]
  }

  // Updates the GeoFireGrid display
  function drawFireGrid() {
    ctx.lineWidth = 1
    let current = 0
    let previous = 0
    let unburnable = 0
    let unburned = 0
    for(let y = north, row = 0; y >= south; y -= ydist, row++) {
      for(let x = west, col = 0; x <= east; x += xdist, col++) {
        const status = fireGrid.status(x, y)
        if (FireStatus.isUnburnable(status)) {
          unburnable++
          ctx.fillStyle = 'black' // unburnable
        }
        // previously burned
        else if (FireStatus.isBurnedAt(status, fireGrid.period().begins())) {
          previous++
          ctx.fillStyle = 'red'
        }
        // ignited during this period
        else if (FireStatus.isBurnedAt(status, fireGrid.period().ends())) {
          current++
          ctx.fillStyle = 'yellow'
        }
        // unburned at end of this period
        else {
          unburned++
          ctx.fillStyle = 'green' // unburned at end of period
        }
        ctx.fillRect(col*xdist, row*ydist, xdist, ydist)
      }
    }
    burnSummary = [
      ['Period Number', fireGrid.period().number()],
      ['Period Begins', fireGrid.period().begins()],
      ['Period Ends', fireGrid.period().ends()],
      ['Ignition Points', fireGrid.ignitionPoints()],
      ['Newly Burned', current],
      ['Previously Burned', previous],
      ['Total Burned', current + previous],
      // ['Unburned', unburned])
      // ['Unburnable', unburnable])
    ]

    if (unburned === 0 || fireGrid.ignitionPoints() === 0) {
      cancelAnimationFrame(frame)
    }
  }

  function drawFirePoint (x, y, color = 'blue', radius = 10) {
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI)
    ctx.stroke()
  }
  function drawFirePointBack () { drawFirePoint((ignX - west + fireBx), (north - ignY - fireBy)) }
  function drawFirePointHead () { drawFirePoint((ignX - west + fireHx), (north - ignY - fireHy))}
  function drawFirePointIgnition () { drawFirePoint((ignX - west), (north - ignY)) }

  // Gets canvas and context once they are mounted
	onMount(() => {
		ctx = canvas.getContext('2d')
    reset()
	})

  function perimeter(len, wid) {
    const a = 0.5 * len
    const b = 0.5 * wid
    const xm = a + b <= 0 ? 0 : (a - b) / (a + b)
    const xk = 1 + xm * xm / 4 + xm * xm * xm * xm / 64
    return Math.PI * (a + b) * xk
  }

  // Reset button callback: resets the GeoFireGrid back to original state
  function reset () {
    fireGrid.reset()
    resetFireEllipseStatus()
    setUnburnablePattern(pattern)
    fireGrid.igniteAt(ignX, ignY, ignT)
    drawFireGrid()
  }

  function resetFireEllipseStatus () {
    fireLength= 0
    fireWidth = 0
    fireHeadRos = 0
    fireBackRos = 0
    fireLwr = 0
    fireHeading = 0
    fireCx = 0
    fireCy = 0
    fireHx = 0
    fireHy = 0
    fireBx = 0
    fireBy = 0
    fireArea = 0
    firePerimeter = 0
    elapsedTime = 0
  }

  // 'Run/Pause' button callback: starts, pauses, and resumes simulation
  function run () {
    running = !running
    if (running) {
      cancelAnimationFrame(frame)
    } else {
      frame = requestAnimationFrame(loop)
		  // return () => { cancelAnimationFrame(frame) }
    }
  }

  // 'Step' button callback: pauses animation and runs 1 burning period
  function step () {
    cancelAnimationFrame(frame)
    burn()
  }

  function setUnburnablePattern (pattern) {
    if (pattern.shortCol) {
      fireGrid.setUnburnableCol(1250, 4250, 4750) // at x=1250 (col 25), y=4250 (row 75) to y=4750 (row 25)
    }
    if (pattern.shortRow) {
      fireGrid.setUnburnableRow(4750, 1250, 1750) // at y=4750 (row 25), x=1250 (col 25) to x=1750 (col 75)
    }
    if (pattern.colHole) {
      fireGrid.setUnburnableCol(1250, 4500, 5000) // at x=1250 (col 25) y=5000 (row 0) to y=4500 (row=50)
      fireGrid.setUnburnableCol(1250, 4000, 4480)
    }
    if (pattern.roads) {
      fireGrid.setUnburnableCol(1500, 4250, 4750)
      fireGrid.setUnburnableCol(1700, 4250, 4750)
      fireGrid.setUnburnableCol(1900, 4250, 4750)
    }
  }
</script>

<svelte:head>
	<title>GeoFireGrid</title>
</svelte:head>

<h5 class='mb-3'>GeoFireGrid Tinker Toy</h5>
<div class="row">
  <div class="col">
    <!-- Button row -->
    <div class="row">
      <div class="col">
        <button class='btn-primary mb-3' on:click={step}>Step</button>
      </div>
      <div class="col">
        <button class='btn-primary mb-3' on:click={run}>{running?'Run':'Pause'}</button>
      </div>
      <div class="col">
        <button class='btn-primary mb-3' on:click={reset}>Reset</button>
      </div>
    </div>
    <!-- Burn status table -->
    <div class="row">
      <SimpleTable title='Burn Status' data={burnSummary} id='geoFireGridSummary' />
    </div>
    <div class="row">
      <SimpleTable title='Fire Ellipse' data={ellipseSummary} id='geoFireGridEllipse' />
    </div>
  </div>

  <div class="col-8">
    <canvas bind:this={canvas} width={width} height={height}></canvas>
  </div>
</div>

<style>
	canvas {
		width: 100%;
    border: 1px solid black;
		background-color: #666;
	}
</style>

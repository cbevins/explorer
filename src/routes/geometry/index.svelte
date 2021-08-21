<script>
	import { onMount } from 'svelte'
  import { GeoFireGrid } from '../../models/GeoFire'
  import SimpleTable from '../../components/SimpleTable.svelte'
  import { drawFireEllipse, fireEllipseStatus, drawFireGrid,
    FireInputProviderMock, ignitionGridTime, setUnburnablePattern } from './index.js'

  // Create a GeoFireGrid instance 1000 ft west-to-east and 1000 ft north-to-south with 10-ft spacing
  let west = 1000
  let east = 2000
  let north = 5000
  let south = 4000
  let xdist = 5
  let ydist = 5
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
  let periodDuration = 1 // minutes
  let periodMax = 24 * 60 // 24 hours

  // Burning stats
  let burnSummary = []
  let ellipseSummary = []
  let ignitionTimes = []
  let running = true

  // Here are some named patterns of unburnable points: TRUE implements it, FALSE ignores it
  let patterns = {
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

    const burn = drawFireGrid(ctx, fireGrid)
    burnSummary = burn.summary

    drawFireEllipse(ctx, fireGrid, ignX, ignY)
    ellipseSummary = fireEllipseStatus(fireGrid)

    if (fireGrid.period().number() === 1) {
      ignitionTimes = ignitionGridTime(fireGrid)
    }
    if (burn.done) cancelAnimationFrame(frame)
  }

  function loop(t) {
    frame = requestAnimationFrame(loop)
    if (fireGrid.period().number() >= periodMax) cancelAnimationFrame(frame)
    burn()
  }

  // Gets canvas and context once they are mounted
	onMount(() => {
		ctx = canvas.getContext('2d')
    reset()
	})

  // Reset button callback: resets the GeoFireGrid back to original state
  function reset () {
    fireGrid.reset()
    setUnburnablePattern(fireGrid, patterns)
    fireGrid.igniteAt(ignX, ignY, ignT)
    drawFireGrid(ctx, fireGrid)
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
      <SimpleTable title='Fire Ellipse' data={ellipseSummary} id='geoFireGridEllipse' />
    </div>
    <div class="row">
      <SimpleTable title='Burn Status' data={burnSummary} id='geoFireGridSummary' />
    </div>
  </div>

  <div class="col-8">
    <canvas bind:this={canvas} width={width} height={height}></canvas>
  </div>
</div>
<div class="row">
  <div class="col">
    <SimpleTable title='Ignition Grid Times' data={ignitionTimes} id='geoFireGridIgnitionTimes' />
  </div>
</div>

<style>
	canvas {
		width: 100%;
    border: 1px solid black;
		background-color: #666;
	}
</style>

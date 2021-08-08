<script>
	import { onMount } from 'svelte'
  import { GeoFireGrid } from '../models/Geo/GeoFireGrid.js'
  import { FireInputProviderMock } from '../models/Geo/FireInputProviderMock.js'
  import { FireStatus } from '../models/Geo/FireStatus.js'

  // Create a GeoFireGrid instance 1000 ft west-to-east and 1000 ft north-to-south with 10-ft spacing
  let west = 1000
  let east = 2000
  let north = 5000
  let south = 4000
  let xdist = 10
  let ydist = 10
  let width = east - west
  let height = north - south

  // Use a fire input provider that yields a spatially and temporally constant set of inputs
  const fireInputProvider = new FireInputProviderMock()

  const fireGrid = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)

  // Ignite a single point at time 0
  let ignX = 1500 // half way between x 1000 and 2000, at col 50
  let ignY = 4500 // half way between y 4000 and 5000, at row 50
  let ignT = 0

  // Burning period duration and maximum burning periods
  let periodDuration = 1 // minutes
  let periodMax = 24 * 60 // 24 hours

  // Burning stats
  let ignitionPts = 0
  let currentPts = 0
  let previousPts = 0
  let unburnedPts = 0
  let unburnablePts = 0

  // Here are some named patterns of unburnable points: TRUE imnplements it, FALSE ignores it
  let pattern = {
    shortCol: false,
    shortRow: false,
    colHole: true,
  }

  // These properties are set by onMount():
	let canvas // reference to the on-screen HTML <canvas> element
  let ctx // reference to the canvas 2d context
  let frame // id of the current animation frame

  function burn () {
    fireGrid.burnForPeriod(periodDuration)
    console.log(fireGrid.periodStats())
    draw()
  }

  function clear () {
    fireGrid.reset()
    setUnburnablePattern(pattern)
    fireGrid.igniteAt(ignX, ignY, ignT)
    draw()
  }

  function draw() {
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
    ignitionPts = fireGrid._ignSet.size
    currentPts = current
    previousPts = previous
    unburnedPts = unburned
    unburnablePts = unburnable
  }

	onMount(() => {
		ctx = canvas.getContext('2d')
    clear()
		return () => { cancelAnimationFrame(frame) }
	})

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
  }
</script>

<svelte:head>
	<title>GeoFireGrid</title>
</svelte:head>

<h5 class='mb-3'>GeoFireGrid Tinker Toy</h5>
  <div class="row">
    <div class="col">
      <button class='btn-primary mb-3' on:click={burn}>Burn</button>
      <button class='btn-primary mb-3' on:click={clear}>Clear</button>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <p>Period {fireGrid.period().number()} {fireGrid.period().begins()} {fireGrid.period().ends()},
        {ignitionPts} Ign Pts,
        {currentPts} new,
        {previousPts} prev,
        {unburnedPts} unburned,
        {unburnablePts} unburnable
      </p>
    </div>
  </div>

  <canvas bind:this={canvas} width={width} height={height}></canvas>

  <style>
	canvas {
		width: 100%;
		height: 100%;
    border: 1px solid black;
		background-color: #666;
	}
</style>

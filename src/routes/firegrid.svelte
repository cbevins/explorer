<script>
	import { onMount } from 'svelte'
  import { FireStatus, GeoFireGrid } from '../models/GeoFire'
  import { FireInputProviderMock } from '../models/FireBehavior'
  import SimpleTable from '../components/SimpleTable.svelte'

  // Create a GeoFireGrid instance 1000 ft west-to-east and 1000 ft north-to-south with 10-ft spacing
  let west = 1000
  let east = 3000
  let north = 5000
  let south = 3000
  let xdist = 10
  let ydist = 10
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
  let summary = []
  let running = true

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

  // Runs GeoFireGrid simulation for 1 burning period
  function burn () {
    fireGrid.burnForPeriod(periodDuration)
    draw()
  }

  function loop(t) {
    frame = requestAnimationFrame(loop)
    if (fireGrid.period().number() >= periodMax) cancelAnimationFrame(frame)
    burn()
  }

  // Updates the GeoFireGrid displai
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
    const d = []
    d.push(['Period Number', fireGrid.period().number()])
    d.push(['Period Begins', fireGrid.period().begins()])
    d.push(['Period Ends', fireGrid.period().ends()])
    d.push(['Ignition Points', fireGrid._ignSet.size])
    d.push(['Newly Burned', current])
    d.push(['Previously Burned', previous])
    d.push(['Unburned', unburned])
    d.push(['Unburnable', unburnable])
    summary = d

    if (unburned === 0 || fireGrid.ignitionPoints() === 0) {
      cancelAnimationFrame(frame)
    }
 }

  // Reset button callback: resets the GeoFireGrid back to original state
  function reset () {
    fireGrid.reset()
    setUnburnablePattern(pattern)
    fireGrid.igniteAt(ignX, ignY, ignT)
    draw()
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

	onMount(() => {
		ctx = canvas.getContext('2d')
    reset()
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
        <SimpleTable title='Burn Status' data={summary} />
      </div>
    </div>

    <div class="col-9">
      <canvas bind:this={canvas} width={width} height={height}></canvas>
    </div>
  </div>

  <style>
	canvas {
		width: 100%;
		height: 100%;
    border: 1px solid black;
		background-color: #666;
	}
</style>

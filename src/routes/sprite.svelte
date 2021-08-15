<script>
	import { onMount } from 'svelte'
  import { FireEllipse } from './../models/FireEllipse'
  import { FireFly, vectorPath } from '../models/FireSprites/FireFly.js'
  import SimpleTable from '../components/SimpleTable.svelte'

  // Parameters
  const width = 200
  const height = 200
  const nsprites = 15
  const r = 1 // FireFly radius
  const maxSteps = 1000

  // Must be reset()
  let cellsTraversed = 0
  let stepNumber = 0
  let running = true
  let head, sprites // FireFly swarm
  let burnSummary = []

  // These properties are set by onMount():
	let canvas // reference to the on-screen HTML <canvas> element
  let ctx // reference to the canvas 2d context
  let frame // id of the current animation frame

  // Field fire codes
  const Unburnable = 0
  const Unburned = 1
  const Burning = 2
  const Burned = 3
  const Color = ['gray', 'green', '#ff8c00', '#cd853f'] // gray, green, darkorange, peru
  const field = new Array(width * height).fill(Unburned)

  // For now, use a single fire behavior ellipse for the entire landscape
  let fire = new FireEllipse(100, 50, 135, 1)
  const fireSummary = [
    ['Head Ros', fire.headRate().toFixed(2)],
    ['Fire Heading', fire.headDegrees().toFixed(0)],
    ['Head at', `[${fire.hx().toFixed(2)}, ${fire.hy().toFixed(2)}]`],
    ['Back at', `[${fire.bx().toFixed(2)}, ${fire.by().toFixed(2)}]`]
  ]

  // Position the ignition point at an optimal location in the landscape
  const ignX = 2 * Math.ceil(width * Math.abs((fire.bx() / fire.hx())))
  const ignY = height - 2 * Math.ceil(height * Math.abs((fire.bx() / fire.hx())))

  // Converts between compass degrees (clockwise wrt North)
  // and device degrees (counter-clockwise wrt East), in either direction:
  function rotate (deg) { return (450 - deg) % 360 }
  //;[0, 45, 90, 135, 180, 225, 270, 315, 360].forEach(deg => {console.log(`${deg} <-> ${rotate(deg)}`)})

  // Creates a new FireFly at [x, y] heading at azimuth (degrees clockwise from north)
  function newFireFly (x, y, azimuth) {
    const ros = fire.betaRate(azimuth * Math.PI / 180)
    return new FireFly(x, y, rotate(azimuth + fire.headDegrees()), ros/fire.length())
  }

  // Create a starter swarm of 360 FireFlys from the ignition point
  function createSwarm () {
    head = newFireFly(ignX, ignY, fire.headDegrees())
    sprites = []
    sprites.push(head)
    for (let i=0; i<nsprites; i++) {
      const deg = i * 360 / nsprites // degrees from fire head!
      sprites.push(newFireFly(ignX, ignY, deg))
    }
    sprites.push(newFireFly(100, 100, 270))
  }

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------

  function burn() {
    drawField()
    drawIgnitionPoint()
    const spawn = []
    // Advance each FireFly
    let cells
    let spacing = 1
    sprites.forEach((sprite, idx) => {
      ctx.beginPath()
      cells = sprite.nextPath(spacing)
      sprite.move()

      // Mark each cell it traverses as Burned
      cellsTraversed += cells.length
      if (!idx) { // only for head sprite for now
        cells.forEach(cell => {
          const deg = (sprite.deg + 90) % 360
          const ffly = newFireFly(cell.x, cell.y, deg)
          ffly.spawn = true
          spawn.push(ffly)
        })
      }
      let col = Math.trunc(sprite.x / spacing)
      let row = Math.trunc(sprite.y / spacing)
      field[col + row * width] = Burned

      // Did we hit the edge of the world?
      if (sprite.x >= width-2*r || sprite.x < 2*r || sprite.y >= height-2*r || sprite.y < 2*r) {
        // console.log(`Stopped after ${stepNumber} steps and ${cellsTraversed} cells burned`)
        cancelAnimationFrame(frame)
        running = !running
        return
      }
      drawFireFly(sprite)
    }) // sprites.forEach()
    sprites = sprites.concat(spawn)

    // Summary update
    burnSummary = [
      ['Step Number', stepNumber],
      ['FireFlys Active', sprites.length],
      ['FireFlys Added', spawn.length],
      ['Cells Traversed', cellsTraversed]
    ]
  }

  function drawField () {
    ctx.fillStyle = Color[Unburned]
    ctx.fillRect(0, 0, width, height)
    for (let row=0; row< height; row++) {
      for (let col = 0; col< width; col++) {
        const idx = col + row * width
        if (field[idx] !== Unburned) {
          ctx.fillStyle = Color[field[idx]]
          ctx.fillRect(col, height - row, 1, 1)
        }
      }
    }
  }

  function drawFireFly (fireFly, radius = 1) {
    // While sprite y-axis increases to the north, the canvas y increases to south
    ctx.fillStyle = fireFly.spawn ? 'yellow' : 'red'
    ctx.ellipse(fireFly.x, (height - fireFly.y), radius, radius, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  function drawIgnitionPoint() {
    ctx.beginPath()
    ctx.fillStyle = 'yellow'
    ctx.ellipse(ignX, height - ignY, r, r, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  function loop(t) {
    frame = requestAnimationFrame(loop)
    stepNumber++
    if (stepNumber >= maxSteps) cancelAnimationFrame(frame)
    burn()
  }

	onMount(() => {
		ctx = canvas.getContext('2d')
    doReset()
	})

  function doReset () {
    cellsTraversed = 0
    stepNumber = 0
    running = true
    createSwarm()
    field.fill(Unburned)
    drawField()
    drawIgnitionPoint()
  }

  // 'Run/Pause' button callback: starts, pauses, and resumes simulation
  function doRun () {
    running = !running
    if (running) {
      cancelAnimationFrame(frame)
    } else {
      frame = requestAnimationFrame(loop)
		  // return () => { cancelAnimationFrame(frame) }
    }
  }

  // 'Step' button callback: pauses animation and runs 1 burning period
  function doStep () {
    cancelAnimationFrame(frame)
    burn()
  }
</script>

<svelte:head>
	<title>Tinker Project</title>
</svelte:head>

<div class="row">
  <div class="col">
    <!-- Button row -->
    <div class="row">
      <div class="col">
        <button class='btn-primary mb-3' on:click={doStep}>Step</button>
      </div>
      <div class="col">
        <button class='btn-primary mb-3' on:click={doRun}>{running?'Run':'Pause'}</button>
      </div>
      <div class="col">
        <button class='btn-primary mb-3' on:click={doReset}>Reset</button>
      </div>
    </div>
    <!-- Burn status table -->
    <div class="row">
      <SimpleTable title='Burn Status' data={burnSummary} id='spriteBurnSummary' />
    </div>
    <div class="row">
      <SimpleTable title='Fire Ellipse' data={fireSummary} id='spriteFireSummary' />
    </div>
  </div>

  <div class="col-8">
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
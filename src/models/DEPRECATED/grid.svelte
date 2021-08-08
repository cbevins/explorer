<script>
	import { onMount } from 'svelte'
  import { FireGrid } from '../models/FireGrid.js'

  let cols = 100
  let rows = 100
  let spacing = 10
  let width = spacing * cols
  let height = spacing * rows

  let fire = new FireGrid(cols, rows)
  let pattern = {
    shortCol: false,
    shortRow: false,
    colHole: true,
  }
  let strikeCol = 50
  let strikeRow = 50

  // These properties are set by onMount()
	let canvas // reference to the on-screen HTML <canvas> element
  let ctx // reference to the canvas 2d context
  let frame // id of the current animation frame

  function burn () {
    fire.burn()
    console.log(fire.count())
    draw()
  }

  function clear () {
    fire.reset()
    setUnburnablePattern(pattern)
    fire.incrementPeriod()
    fire.strike(strikeCol, strikeRow)
    draw()
  }

  function draw() {
    ctx.lineWidth = 1
    for(let row=0; row<rows; row++) {
      for(let col=0; col<cols; col++) {
        const status = fire.getColRow(col, row)
        if (status === 0) ctx.fillStyle = 'green'
        else if (status > 0) ctx.fillStyle = 'red'
        else ctx.fillStyle = 'black'
        ctx.fillRect(col*spacing, row*spacing, spacing, spacing)
      }
    }
  }

	onMount(() => {
		ctx = canvas.getContext('2d')
    clear(50, 50)
		return () => { cancelAnimationFrame(frame) }
	})

  function setUnburnablePattern (pattern) {
    if (pattern.shortCol) fire.setUnburnableCol(25, 25, 75)
    if (pattern.shortRow) fire.setUnburnableRow(25, 25, 75)
    if (pattern.colHole) {
      fire.setUnburnableCol(25, 0, 49)
      fire.setUnburnableCol(25, 51, 99)
    }
  }
</script>

<svelte:head>
	<title>Geo Grid</title>
</svelte:head>

<h5 class='mb-3'>Geo Grid Tinker Toy</h5>
  <div class="row">
    <div class="col">
      <button class='btn-primary mb-3' on:click={burn}>Burn</button>
      <button class='btn-primary mb-3' on:click={clear}>Clear</button>
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

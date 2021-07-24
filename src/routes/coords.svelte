<script>
	import { onMount } from 'svelte';
  import { FireEllipse } from './../models/FireEllipse.js'

  const scene = {
    width: 1000, // canvas width
    height: 1000, // canvas height
  }

  const geo = {
    bounds: {
      west: 2000, // x-coordinate of eastern edge { west < east)}
      north: 5000, // y-coordinate of northern edge (north > south)
      east: 3000, // x-coordinate of eastern edge (east > west)
      south: 4000, // y-coordinate of southern edge (south < north)
    },
    grid: {
      xSpacing: 10, // east-west distance between points, or cell width
      ySpacing: 10, // north-south distance between points, or cell height
      cols: null, // number of columns from bounds.west with east-west xSpacing
      rows: null // number of rows from bounds.north with north-south ySpacing
    }
  }
  geo.bounds.width = geo.bounds.east - geo.bounds.west
  geo.bounds.height = geo.bounds.north - geo.bounds.south
  geo.grid.cols = Math.ceil(geo.bounds.width / geo.grid.xSpacing)
  geo.grid.rows = Math.ceil(geo.bounds.height / geo.grid.ySpacing)

	let canvas, ctx

  // Create a FireEllipse of length 100, width 50, heading to the southeast for 1 time step
  let fire = new FireEllipse(100, 50, 135, 1)
  console.log('RoS', fire.headRate(), 'Towards', fire.headDegrees(),
    'Head at', fire.hx(), fire.hy(), 'Back at',  fire.bx(), fire.by())

  function draw () {
    ctx.fillStyle = 'green'
    ctx.fillRect(0, 0, scene.width, scene.height)

    ctx.fillStyle = 'red'
    ctx.ellipse(250, 250, 100, 50, (135 * Math.PI / 180), 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = 'red'
    ctx.ellipse(250, 250, 100, 50, (135 * Math.PI / 180), 0, 2 * Math.PI)
    ctx.fill()
  }

	onMount(() => {
		ctx = canvas.getContext('2d')
    canvas.addEventListener("click", function(e){ // 'mousedown', 'mouseup', 'mousemove', 'mouseout', 'mouseover'
      console.log('Mouse click e.{x|y}', e.x, e.y)
      console.log('Mouse click e.offset{x|y}', e.offsetX, e.offsetY)
      console.log('Mouse click e.layer{x|y}', e.layerX, e.layerY)
      console.log('Mouse click e.client{x|y}', e.clientX, e.clientY)
      console.log('Mouse click e.local{x|y}', e.localX, e.localY)
      console.log('Mouse click windowToCanvas', windowToCanvas(canvas, e.clientX, e.clientY))
    })
    draw()
	})

  function windowToCanvas(canvas, x, y) {
    const bbox = canvas.getBoundingClientRect()
    console.log(bbox)
    return { x: x - bbox.left * (canvas.width  / bbox.width),
            y: y - bbox.top  * (canvas.height / bbox.height)}
  }
</script>

<svelte:head>
	<title>Tinker Project</title>
</svelte:head>
<h5>Register geographic and device coordinates</h5>

<canvas
	bind:this={canvas} width={scene.width} height={scene.height}
></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
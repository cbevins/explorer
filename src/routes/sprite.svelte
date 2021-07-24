<script>
	import { onMount } from 'svelte'
  import { FireEllipse } from './../models/FireEllipse.js'
  import { FireFly, vectorPath } from '../models/FireSprites/FireFly.js'

  // Parameters
  const width = 200
  const height = 200
  const nsprites = 15
  const r = 1 // FireFly radius
	let canvas, ctx, frame

  // Field fire codes
  const Unburnable = 0
  const Unburned = 1
  const Burning = 2
  const Burned = 3
  const Color = ['gray', 'green', '#ff8c00', '#cd853f'] // gray, green, darkorange, peru
  const field = new Array(width * height).fill(Unburned)

  // To convert between compass and device degrees, in either direction:
  function rotate (deg) { return (450 - deg) % 360 }
  //;[0, 45, 90, 135, 180, 225, 270, 315, 360].forEach(deg => {console.log(`${deg} <-> ${rotate(deg)}`)})

  // Get the current fire behavior
  let fire = new FireEllipse(100, 50, 135, 1)
  console.log('RoS', fire.headRate(), 'Towards', fire.headDegrees(),
    'Head at', fire.hx(), fire.hy(), 'Back at',  fire.bx(), fire.by())

  // Creates a new FireFly at [x, y] heading at azimuth (degrees clockwise from north)
  function newFireFly (x, y, azimuth) {
    const ros = fire.betaRate(azimuth * Math.PI / 180)
    return new FireFly(x, y, rotate(azimuth + fire.headDegrees()), ros/fire.length())
  }

  // Position the ignition point in an optimal place
  const ignX = 2 * Math.ceil(width * Math.abs((fire.bx() / fire.hx())))
  const ignY = height - 2 * Math.ceil(height * Math.abs((fire.bx() / fire.hx())))

  // Create a starter swarm of 360 FireFlys from the ignition point
  const head = newFireFly(ignX, ignY, fire.headDegrees())
  console.log(head)
  let sprites = []
  sprites.push(head)
  for (let i=0; i<nsprites; i++) {
    const deg = i * 360 / nsprites // degrees from fire head!
    sprites.push(newFireFly(ignX, ignY, deg))
  }
  sprites.push(newFireFly(100, 100, 270))

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------
  let step = 0 // loop number
  let ncells = 0 // number of cells traverse

  function loop(t) {
    frame = requestAnimationFrame(loop)
    step++
    const spawn = []

    ctx.fillStyle = Color[Unburned]
    ctx.fillRect(0, 0, width, height)
    // Field
    for (let row=0; row< height; row++) {
      for (let col = 0; col< width; col++) {
        const idx = col + row * width
        if (field[idx] !== Unburned) {
          ctx.fillStyle = Color[field[idx]]
          ctx.fillRect(col, height - row, 1, 1)
        }
      }
    }
    // ignition point
    ctx.beginPath()
    ctx.fillStyle = 'yellow'
    ctx.ellipse(ignX, height - ignY, r, r, 0, 0, 2 * Math.PI)
    ctx.fill()

    // Advance each FireFly
    let _x0, _y0, _x1, _y1, cells
    let spacing = 1
    sprites.forEach((sprite, idx) => {
      ctx.beginPath()
      cells = sprite.nextPath(spacing)
      sprite.move()

      // Mark each cell its travels thru as Burned
      ncells += cells.length
      if (!idx) { // only for head sprite for now
        cells.forEach(cell => {
          const deg = (sprite.deg + 90) % 360
          const ffly = newFireFly(cell.x, cell.y, deg)
          console.log(`From ${sprite.x}, ${sprite.y}, Added FireFly at [${cell.x}, ${cell.y}]`)
          ffly.spawn = true
          spawn.push(ffly)
        })
      }
      let col = Math.trunc(sprite.x / spacing)
      let row = Math.trunc(sprite.y / spacing)
      field[col + row * width] = Burned

      // Did we hit the edge of the world?
      if (sprite.x >= width-2*r || sprite.x < 2*r || sprite.y >= height-2*r || sprite.y < 2*r) {
        console.log(`Stopped after ${step} steps and ${ncells} cells burned`)
        cancelAnimationFrame(frame)
        return
      }

      // if (idx===0) console.log(`Step ${step} Sprite ${idx} [${sprite.x}, ${sprite.y}`)
      // While sprite y-axis increases to the north, the canvas y increases to south
      const canvasY = height - sprite.y
      const canvasX = sprite.x
      ctx.fillStyle = sprite.spawn ? 'yellow' : 'red'
      ctx.ellipse(canvasX, canvasY, r, r, 0, 0, 2 * Math.PI)
      ctx.fill()
    }) // sprites.forEach()
    sprites = sprites.concat(spawn)
    // console.log(`Step ${step} has ${sprites.length} FireFlys (added ${spawn.length})`)
  }

	onMount(() => {
		ctx = canvas.getContext('2d')
		frame = requestAnimationFrame(loop)
		return () => {
			cancelAnimationFrame(frame)
		}
	})
</script>

<svelte:head>
	<title>Tinker Project</title>
</svelte:head>
<p>Step {step}</p>
<canvas
	bind:this={canvas} width={width}	height={height}
></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
    border: 1px solid black;
		background-color: #666;
	}
</style>
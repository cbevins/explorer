<script>
	import { onMount } from 'svelte';

	let canvas

	onMount(() => {
		const ctx = canvas.getContext('2d')
		let frame = requestAnimationFrame(loop)

		function loop(t) {
			frame = requestAnimationFrame(loop)
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
			for (let p = 0; p < imageData.data.length; p += 4) {
				const i = p / 4
				const x = i % canvas.width
				const y = i / canvas.height >>> 0

				const r = 64 + (128 * x / canvas.width) + (64 * Math.sin(t / 1000))
				const g = 64 + (128 * y / canvas.height) + (64 * Math.cos(t / 1000))
				const b = 128;

				imageData.data[p + 0] = r
				imageData.data[p + 1] = g
				imageData.data[p + 2] = b
				imageData.data[p + 3] = 255
			}

			ctx.putImageData(imageData, 0, 0)
		}

		return () => {
			cancelAnimationFrame(frame)
		}
	})
</script>

<svelte:head>
	<title>Tinker Project</title>
</svelte:head>

<canvas
	bind:this={canvas}
	width={32}
	height={32}
></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
    border: 1px solid black;
		background-color: #666;
		-webkit-mask: url(logo-512.png) 50% 50% no-repeat;
		mask: url(logo-512.png) 50% 50% no-repeat;
	}
</style>
<script>
	export let segment;
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">Home</a></li>
		<!-- <li><a aria-current="{segment === 'sprite' ? 'page' : undefined}" href="sprite">Sprite</a></li> -->
		<li><a aria-current="{segment === 'firegrid' ? 'page' : undefined}" href="firegrid">FireGrid</a></li>
		<li><a aria-current="{segment === 'geometry' ? 'page' : undefined}" href="geometry">Geometry</a></li>
		<li><a aria-current="{segment === 'igntmesh' ? 'page' : undefined}" href="igntmesh">IgntMesh</a></li>
		<li><a aria-current="{segment === 'firemesh' ? 'page' : undefined}" href="firemesh">FireMesh</a></li>
		<!-- <li><a aria-current="{segment === 'coords' ? 'page' : undefined}" href="coords">Coords</a></li> -->
		<!-- <li><a aria-current="{segment === 'canvasLogo' ? 'page' : undefined}" href="canvasLogo">CanvasLogo</a></li> -->
		<!-- <li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">About</a></li> -->
		<!-- <li><a aria-current="{segment === 'releaseNotes' ? 'page' : undefined}" href="releaseNotes">Release Notes</a></li> -->
	</ul>
</nav>

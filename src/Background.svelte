<script>
	const layers = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  export let y
</script>

<div class="parallax-container">
	{#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as layer}
		<img
			style="transform: translate(0,{-y * layer / (layers.length - 1)}px)"
			src="https://gitee.com/fortwind/images/raw/master/info/bg/parallax{layer}.png"
			alt="parallax layer {layer}"
		>
	{/each}
</div>

<div class="content">
	<span style="opacity: {1 - Math.min(y, 40) / 40}">
		fortwind
	</span>

	<div class="foreground">
		<slot></slot>
	</div>
</div>

<style>
	.parallax-container {
		position: fixed;
		width: 2400px;
		height: 712px;
		left: 50%;
		transform: translate(-50%,0);
	}

	.parallax-container img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		will-change: transform;
	}

	.parallax-container img:last-child::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: rgb(45,10,13);
	}

	.content {
		position: relative;
		width: 100%;
		color: rgb(220,113,43);
		margin-top: 4em;
		box-sizing: border-box;
	}

	span {
		position: absolute;
		font-size: 1em;
		text-transform: uppercase;
    font-weight: bold;
		will-change: transform, opacity;
		left: 50%;
    transform: translateX(-50%);
	}

	.foreground {
		position: relative;
		top: 710px;
		left: 0;
		width: 100%;
		background-color: rgb(32,0,1);
		color: white;
		padding-bottom: 36px;
	}
</style>

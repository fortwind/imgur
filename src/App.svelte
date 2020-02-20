<script>
import Background from './Background.svelte'
import Imgur from './Imgur.svelte'
import Navgation from './Navgation.svelte'

let scrolly = 0
</script>

<svelte:window bind:scrollY={scrolly}/>
<div id="app">
	<Background y={scrolly}>
		<Navgation scrolly={scrolly} />
		<Imgur scrolly={scrolly} />
	</Background>
</div>

<style>
#app {
	position: relative;
	width: 100%;
	height: 100%;
}

:global(html), :global(body) {
	position: relative;
	width: 100%;
	height: 100%;
}

:global(body) {
	color: #333;
	margin: 0;
	box-sizing: border-box;
	background-color: rgb(253, 174, 51);
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
}
</style>
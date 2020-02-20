<script>
import { onMount, createEventDispatcher } from 'svelte'
export let src
export let name
export let node

let img
const decorate_class = '' // 否则.img.load样式不加载

const dispatch = createEventDispatcher()

function getBig () {
  dispatch('getBig', src)
}

onMount(() => {
  node = img
})
</script>

<div class="image-container">
  <div class="image" on:click={getBig}>
    <div class="img-container">
      <!-- <img bind:this={img} class="img" data-src="{src}" src="{lazyload ? ((scrolly + 800) > imgtop ? src : '') : src}" alt="img"> -->
      <img bind:this={img} class="img{decorate_class}" data-src={src} alt="img">
      <div class="name">{name}</div>
    </div>
  </div>
</div>

<style>
.image-container {
  display: inline-block;
  width: 25%;
  padding: 12px;
  box-sizing: border-box;
}

.image {
  position: relative;
  height: 196px;
  cursor: pointer;
}

.img-container {
  overflow: hidden;
}

.img-container {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.img-container .img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.5);
  transition: opacity 0.8s, transform 0.8s;
}

.img-container .img.load{
  opacity: 1;
  transform: none; /* 由于object-fit，最后未必就是scale(1) */
}

.img-container .name {
  position: absolute;
  width: 100%;
  height: 28px;
  bottom: 0;
  left: 0;
  padding-right: 12px;
  color: #ffffff;
  background: #00000031;
  line-height: 25px;
  text-align: right;
  box-sizing: border-box;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image:hover .img-container {
  transform: scale(1.05);
}

.image:hover .img-container .name {
  transform: translateY(0);
}

@media (max-width: 992px) {
	.image-container {
    width: 50%;
	}
}

@media (max-width: 768px) {
  .image {
    height: calc(196 / 768 * 100vw);
  }
}
</style>
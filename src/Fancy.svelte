<script>
export let show
export let src

let node = { loading: false, w: '', h: '' }
let fancy
let visible = false
let animate_class = ''

$: { fancyLoad(show, src) }

function fancyLoad (show, src) {
  const { img } = node
  if (show) {
    visible = show
    img.src = src
    animate_class = ' animatein'
    node.loading = true
    const { width, height } = fancy.getBoundingClientRect()
    img.onload = () => {
      node.loading = false
      const iw = img.width
      const ih = img.height
      const sw = width * 0.7
      const sh = height * 0.7
      const scaleW = sw / iw
      const scaleH = sh / ih
      if (scaleH > scaleW) {
        node.w = sw
        node.h = ih * scaleW // < ih * scaleH = sh // 直接设置img.height 就固定了，后面获取不会改
      } else {
        node.w = iw * scaleH
        node.h = sh
      }
    }
  } else {
    fancyClose()
  }
}

function fancyClose () {
  animate_class = ''
  setTimeout(() => {
    visible = false
  }, 500)
}

function scrollHandle () {
  console.log(999)
}
</script>

<div bind:this={fancy} class="fancy{animate_class}" style="visibility: {visible ? 'visible' : 'hidden'}">
  <div class="fancy-mask" on:click={() => { show = false }}></div>
  <div class="fancy-imgbox">
    <img bind:this={node.img} on:mousewhell={scrollHandle} alt="" class="fancy-img" style="display: {node.loading ? 'none' : ''};height: {node.h}px;width: {node.w}px">
    <span style="display: {node.loading ? '' : 'none'}">Loading...</span>
  </div>
  <div class="fancy-close">
    <button class="button closebtn" on:click={() => { show = false }}></button>
  </div>
</div>

<style>
.button {
  margin: 0;
  padding: 0;
  outline: 0;
  border-width: 0px;
}

.fancy{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000e3;
  opacity: 0;
  z-index: 11;
  transition: opacity 500ms;
}
.fancy.animatein {
  opacity: 1;
}

.fancy-mask {
  position: relative;
  width: 100%;
  height: 100%;
}

.fancy-imgbox {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1em;
  opacity: 0;
  background-color: #ffffff;
  transition: opacity 500ms;
}
.fancy.animatein .fancy-imgbox {
  opacity: 1;
}

.fancy-close {
  position: absolute;
  top: 0;
  left: 100%;
  height: 90px;
  width: 90px;
  transform: translate(0, -100%);
  transition: transform 500ms;
  /* animation: movein 500ms ease; */
}
.fancy.animatein .fancy-close {
  transform: translate(-50%, -50%);
}

.closebtn {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 50%;
  background-color: #242424;
  cursor: pointer;
}

.closebtn::before, .closebtn::after {
  position: absolute;
  content: '';
  bottom: 18px;
  left: 24px;
  height: 18px;
  width: 4px;
  border-radius: 4px;
  background-color: #a7a7a7;
  transition: transform 300ms;
}
.closebtn::before {
  transform: rotate(45deg);
}
.closebtn::after {
  transform: rotate(-45deg);
}
.closebtn:hover::before {
  transform: rotate(135deg);
}
.closebtn:hover::after {
  transform: rotate(-135deg);
}
</style>
<script>
import { onMount, tick } from 'svelte'
import Image from './Image.svelte'
// import fancy from './fancy.js'
import fancyEntry from './fancy.js'

export let scrolly

const owner = 'fortwind'
const repo = 'images'
const sha = 'master'

let fancy

let imgs_path = []
let imgs_path_backup = []

$: { imgLoad(scrolly) } // 这样只会监听scrolly，不会监听到别的参数

const getPath = () => fetch(`https://gitee.com/api/v5/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`)
	.then(response => response.json())
	.catch(err => err)

function fillImgs (tree) {
  const type = ['jpg', 'png', 'jpeg', 'gif', 'webp']
  const regex_tree = /^img\/(.+\/)*(.+\.\w+)$/

  imgs_path_backup = imgs_path = tree.map(v => {
    const val = regex_tree.exec(v.path)
    const valsplit = val ? val[2].split('.') : [false]
    if (valsplit[0] && type.includes(valsplit.splice(-1)[0].toLowerCase())) {
      v.name = val[2]
      v.target = { node: undefined, load: false, lazy: true }
      return v
    }
    return undefined
  }).filter(k => k)
  // imgs_path = [imgs_path[0]]
}

function imgLoad(y) {
  if (imgs_path_backup.length < 1 || !imgs_path_backup[0]) return false
  let temp = []
  imgs_path_backup.map(v => {
    const { load, node, top, lazy } = v.target
    if (load) return false
    const setsrc = () => {
      node.src = node.getAttribute('data-src')
      node.classList.add('load')
      v.target.load = true // 并无法监听target.node改变并赋值给子组件，所以直接设置src
    }
    if (lazy) {
      (y + 660) > top ? setsrc() : temp.push(v)
    } else {
      setsrc()
    }
  })
  imgs_path_backup = temp // lazy true && load false
}

function getBig (i, e) {
  fancy.$set({
    show: true,
    src: e.detail
  })
}

onMount (async () => {
	const res = await getPath()
	res && res.tree && fillImgs(res.tree)
  await tick()
  fancy = fancyEntry()
  // console.log(document.documentElement.scrollTop, '=---')
  const { scrollTop } = document.documentElement // 绑定的值都会有一定延迟，直接获取快
  imgs_path.map(({ target }) => {
    target.top = target.node.getBoundingClientRect().top + scrollTop
  })
})
</script>

<div class="imgur">
  <div class="images">
  {#each imgs_path as { path, name, target }, i}
    <Image bind:node={target.node} src={`https://gitee.com/${owner}/${repo}/raw/${sha}/${path}`} name={name} on:getBig={(e) => getBig(i, e)}></Image>
  {/each}
  </div>
</div>

<style>
.imgur {
	width: calc(100% - 80px);
	margin: auto;
  padding-top: 52px;
}

.images {
	width: 100%;
}

@media (min-width: 1280px) {
	.imgur {
    width: 1200px;
	}
}
</style>
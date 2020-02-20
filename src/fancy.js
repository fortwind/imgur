import Fancy from './Fancy.svelte'

const fancyEntry = (props = { show: false }) => new Fancy({
  target: document.body,
  props
})

export default fancyEntry // 可以根据需要创建多个实例

// const fancy = new Fancy({
//   target: document.body,
//   props: { display: 'none' }
// })

// export default fancy // 这样只有一个实例
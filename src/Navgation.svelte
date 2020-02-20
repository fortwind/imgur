<script>
import { onMount } from 'svelte'
export let scrolly

let header
let stickpos

onMount(() => {
  const { top } = header.getBoundingClientRect()
  const { scrollTop } = document.documentElement
  stickpos = top + scrollTop
  console.log(stickpos)
})
</script>

<div bind:this={header} class="header-container">
  <header class="header{ scrolly > stickpos ? ' sticky' : '' }">
    <nav class="nav">
      <a href="http://fortwind.gitee.io/blog/" class="home">Fortwind</a>
      <ul class="ul">
        <li class="li menu">Menu</li>
        <li class="li minscreen">
          <a href="https://gitee.com/fortwind/imgur">
            <svg t="1582197687311" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="955" width="20" height="20">
              <path d="M512 1024C229.2224 1024 0 794.7776 0 512S229.2224 0 512 0s512 229.2224 512 512-229.2224 512-512 512z m259.1488-568.8832H480.4096a25.2928 25.2928 0 0 0-25.2928 25.2928l-0.0256 63.2064c0 13.952 11.3152 25.2928 25.2672 25.2928h177.024c13.9776 0 25.2928 11.3152 25.2928 25.2672v12.6464a75.8528 75.8528 0 0 1-75.8528 75.8528H366.592a25.2928 25.2928 0 0 1-25.2672-25.2928v-240.1792a75.8528 75.8528 0 0 1 75.8272-75.8528h353.9456a25.2928 25.2928 0 0 0 25.2672-25.2928l0.0768-63.2064a25.2928 25.2928 0 0 0-25.2672-25.2928H417.152a189.6192 189.6192 0 0 0-189.6192 189.6448v353.9456c0 13.9776 11.3152 25.2928 25.2928 25.2928h372.9408a170.6496 170.6496 0 0 0 170.6496-170.6496v-145.408a25.2928 25.2928 0 0 0-25.2928-25.2672z" fill="#C71D23" p-id="956"></path>
            </svg>
            <span>项目地址1</span>
          </a>
        </li>
        <li class="li minscreen">
          <a href="https://github.com/fortwind/imgur">
            <svg t="1582199407161" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2015" width="20" height="20">
              <path d="M511.966 0C229.239 0 0 229.239 0 512.034 0 738.236 146.705 930.133 350.174 997.82c25.6 4.71 34.918-11.094 34.918-24.679 0-12.151-0.409-44.339-0.682-87.074-142.405 30.959-172.476-68.642-172.476-68.642-23.279-59.119-56.832-74.888-56.832-74.888-46.49-31.744 3.516-31.13 3.516-31.13 51.37 3.618 78.438 52.77 78.438 52.77 45.67 78.268 119.808 55.672 148.992 42.564 4.642-33.109 17.886-55.671 32.495-68.471-113.698-12.903-233.199-56.832-233.199-253.031 0-55.91 19.934-101.614 52.702-137.386-5.291-12.971-22.835-65.024 5.017-135.51 0 0 42.974-13.755 140.8 52.498a490.07 490.07 0 0 1 128.171-17.238 490.836 490.836 0 0 1 128.171 17.238c97.758-66.253 140.663-52.498 140.663-52.498 27.921 70.486 10.343 122.539 5.086 135.51 32.836 35.772 52.634 81.476 52.634 137.386 0 196.677-119.706 239.958-233.779 252.655 18.397 15.804 34.781 47.036 34.781 94.789 0 68.471-0.648 123.699-0.648 140.458 0 13.688 9.25 29.628 35.225 24.645C877.431 929.929 1024 738.167 1024 512.034 1024 229.239 794.726 0 511.966 0" fill="#C71D23" p-id="2016"></path>
            </svg>
            <span>项目地址2</span>
          </a>
        </li>
        <!-- <li class="li">12</li> -->
      </ul>
    </nav>
  </header>
</div>

<style>
.header-container {
  position: relative;
  width: 100%;
  height: 48px;
}
.header {
  width: 100%;
  height: 48px;
  box-shadow: 1px 2px 5px 0px #3f0103;
  background-color: rgb(32,0,1);
  opacity: 0;
  transform: translate(0, -100%);
  transition: opacity 300ms, transform 300ms;
}

.header.sticky {
  position: fixed;
  top: 0;
  z-index: 10;
  opacity: 1;
  transform: translate(0, 0);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 4.8rem;
  box-sizing: border-box;
}

.home {
  color: rgb(220,113,43);
  text-decoration: none;
}

.ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.li.menu {
  display: none;
}

.li {
  display: inline;
}

.li a {
  padding: 0 0.8rem;
  text-decoration: none;
  color: rgb(220,113,43);
}

.li span {
  display: none;
  color: #ffffff;
}

.icon {
  vertical-align: middle;
}

@media (max-width: 768px) {
  .nav {
    padding: 0 1.8rem;
  }

  .ul {
    align-self: start;
  }

  .li {
    padding: 13px;
  }

  .li.menu {
    display: block;
    color: rgb(220,113,43);
    cursor: pointer;
    text-align: right;
  }

  .li.minscreen {
    display: none;
    background-color: #3f0103;
    transform-origin: top;
    animation: fadein 300ms ease;
  }

  @keyframes fadein {
    from { transform: scaleY(0); }
    to { transform: scale(1); }
  }

  .li.minscreen span {
    display: inline;
    transition: color 300ms;
  }

  .li.minscreen:hover span{
    color: rgb(220,113,43);
  }

  .ul:hover .li.minscreen {
    display: block;
  }
}
</style>
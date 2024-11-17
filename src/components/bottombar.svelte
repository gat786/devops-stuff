<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let scrollPercentState = writable(0);

  function getScrollPercentage() {
    let scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    return Math.floor(scrollPercent); 
  }

  onMount(() => {
    addEventListener("scroll", (event) => {
      let scrollPercent = getScrollPercentage();
      console.log("Scroll Percent", scrollPercent);
      scrollPercentState.set(scrollPercent);      
    });
  });
</script>

<div class="fixed bottom-0 w-full h-2 bg-transparent">
  <div class="h-full bg-green-500 dark:bg-green-500" style={`width: ${$scrollPercentState}%;`}></div>
</div>

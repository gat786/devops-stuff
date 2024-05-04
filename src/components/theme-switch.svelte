<div>
  <button
    on:click={() => {
      toggleTheme({themeName: 'light'})
    }}>
    Light
  </button>
  <button
    on:click={() => { 
      toggleTheme({themeName: 'dark'})
    }}>
    Dark
  </button>
</div>


<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const theme = writable("light");

  onMount(() => {
    theme.set(localStorage.getItem("theme") || "light");
    const htmlElement = document.getElementsByTagName('html')[0];
    if (htmlElement) {
      htmlElement.setAttribute('class', $theme);
    }

    theme.subscribe((value) => {
      localStorage.setItem("theme", value);
      htmlElement.setAttribute('class', value);
    });
  });

  function toggleTheme({themeName = 'dark'}) {
    console.log('themeName', themeName);
    theme.update((value) => themeName);
  }
</script>

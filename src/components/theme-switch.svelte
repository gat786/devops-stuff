<script>
  import Moon from "$lib/icons/moon.svelte";
  import Sun from "$lib/icons/sun.svelte";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const theme = writable("light");

  onMount(() => {
    theme.set(localStorage.getItem("theme") || "light");
    const htmlElement = document.getElementsByTagName("html")[0];
    if (htmlElement) {
      htmlElement.setAttribute("class", $theme);
    }

    theme.subscribe((value) => {
      localStorage.setItem("theme", value);
      htmlElement.setAttribute("class", value);
    });
  });

  function toggleTheme({ themeName = "dark" }) {
    console.log("themeName", themeName);
    theme.update((value) => themeName);
  }
</script>

<div>
  <button
    class="bg-white border border-gray-200 text-yellow-300 py-1 px-2 rounded-md size-16"
    on:click={() => {
      toggleTheme({ themeName: "light" });
    }}
  >
    <Sun />
  </button>
  <button
    class="bg-black text-white py-1 px-2 rounded-md size-16"
    on:click={() => {
      toggleTheme({ themeName: "dark" });
    }}
  >
    <Moon />
  </button>
</div>

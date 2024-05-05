<script lang="ts">
  import Heading from "../../components/heading.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  console.log(data)
</script>

<Heading/>

<head>
  <title>Latest Blogs</title>
</head>

<main>
  <h1>Latest Blogs</h1>
  <ul>
    {#each data.blogs as blog}
      <li>
        <a href={`blogs/${blog.front_matter.url_postfix}`}>
          <h2>{blog.front_matter.title}</h2>
        </a>
      </li>
    {/each}
  </ul>
</main>

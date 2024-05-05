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

<main class="flex flex-col items-center mt-4 w-full">
  <h2 class="text-xl font-bold font-mono">Latest Blogs</h2>
  <ul>
    {#each data.blogs as blog}
      <a href={`/blogs/${blog.front_matter.url_postfix}`}>
        <div class="border w-96 h-48 m-4">
          <li>
            <a href={`blogs/${blog.front_matter.url_postfix}`}>
              <h2>{blog.front_matter.title}</h2>
            </a>
          </li>
        </div>
      </a>
    {/each}
  </ul>
</main>

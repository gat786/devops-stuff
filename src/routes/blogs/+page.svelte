<script lang="ts">
  import Heading from "../../components/heading.svelte";
  import ShareIcon from "$lib/icons/share.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<style>
  li {
    list-style-type: none;
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }

  li a {
    /* wrap text in 1 line */
    white-space: nowrap;
    text-decoration: none;

    color: #333;
  }
</style>

<Heading/>

<head>
  <title>Latest Blogs</title>
</head>

<main class="flex flex-col items-center mt-4 w-full">
  <h2 class="text-xl font-bold font-mono">Latest Blogs</h2>
  <div class="border border-black p-2">
    <ul class="w-full flex flex-col">
      {#each data.blogs as blog}
        <li>
          <a 
            href={`/blogs/${blog.front_matter.url_postfix}`}
            class="font-light hover:font-medium"
            target="_blank">
            <h1 class="text-lg text-black dark:text-white">
              {blog.front_matter.title}
            </h1>
          </a>

          <div class="text-sm font-thin">
            Date - {blog.front_matter.created_on.toLocaleDateString()}
          </div>

          <div class="text-sm font-thin">
            Authors - {blog.front_matter.authors.join(", ")}
          </div>
        </li>
      {/each}
  
      <!-- <div class="flex flex-col my-4 mx-4 gap-4 md:w-2/3">
        <a href={`/blogs/${blog.front_matter.url_postfix}`} target="_blank">
          <h2 class="text-xl font-mono font-medium md:truncate line-clamp-2">{blog.front_matter.title}</h2>
        </a>
        <div class="text-sm font-thin">
          Date - {blog.front_matter.created_on.toLocaleDateString()}
        </div>
        <div class="text-sm font-thin">
          Authors - {blog.front_matter.authors.join(", ")}
        </div>
        <div class="flex gap-4">  
          <button 
            class="flex gap-4 align-middle" 
            on:click={async () => {
              if (navigator.canShare()){
                await navigator.share({
                  title: blog.front_matter.title,
                  text: blog.front_matter.description,
                  url: `https://devops-stuff.dev/blogs/${blog.front_matter.url_postfix}`
                })
              } else {
                
              }
            }}>
            Share
            <ShareIcon />
          </button>
        </div>
      </div> -->
    </ul>
  </div>
</main>

<script lang="ts">
  import Heading from "../../components/heading.svelte";
  import ShareIcon from "$lib/icons/share.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<Heading/>

<head>
  <title>Latest Blogs</title>
</head>

<main class="flex flex-col items-center mt-4 w-full">
  <h2 class="text-xl font-bold font-mono">Latest Blogs</h2>
  <ul class="w-full flex flex-col items-center">
    {#each data.blogs as blog}
      <div class="w-10/12 md:w-2/3">
        <div class="border m-4 p-2 flex flex-col md:flex-row">
          <img 
            src={`${blog.front_matter.posterImage}`} 
            class="w-full md:w-48 h-48 object-cover" 
            alt={`poster for ${blog.front_matter.title}`} />
          <div class="flex flex-col my-4 mx-4 gap-4">
            <a href={`/blogs/${blog.front_matter.url_postfix}`} >
              <h2 class="text-xl font-mono font-medium md:truncate line-clamp-2">{blog.front_matter.title}</h2>
            </a>
            <div class="text-sm font-thin">Date - {blog.front_matter.created_on.toLocaleDateString()}</div>
            <div class="text-sm font-thin">Authors - {blog.front_matter.authors.join(", ")}</div>
            <div class="flex gap-4">
              Share
              <button on:click={async () => {
                if (navigator.canShare()){
                  await navigator.share({
                    title: blog.front_matter.title,
                    text: blog.front_matter.description,
                    url: `https://devops-stuff.dev/blogs/${blog.front_matter.url_postfix}`
                  })
                } else {
                  
                }
              }}>
                <ShareIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </ul>
</main>

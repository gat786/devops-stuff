<script lang="ts">
  import Heading from "../../components/heading.svelte";
  import ShareIcon from "$lib/icons/share.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<style>
  .ow{
    overflow-wrap: break-word;
  }
</style>

<Heading/>

<head>
  <title>Latest Blogs</title>
</head>

<main class="flex flex-col my-6 items-center">
  <h2 class="text-xl font-bold font-mono">Latest Blogs</h2>
  <div class="">
    <ul class="flex flex-col gap-y-8 my-12 mx-8 md:mx-0">
      {#each data.blogs as blog}
        <li class="">
          <a
            href={`/blogs/${blog.front_matter.url_postfix}`}
            class="font-light mx-auto hover:font-medium"
            target="_blank">
            <div class="text-sm font-thin dark:text-gray-200">
              <span class="">
                Date:
              </span>
              <span class="underline underline-offset-4">
                {blog?.front_matter?.created_on?.toLocaleDateString()}
              </span>
            </div>
            <br/>
            <span class="text-lg text-black dark:text-white">
              {blog.front_matter.title}
            </span>
          </a>
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

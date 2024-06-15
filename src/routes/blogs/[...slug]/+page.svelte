<script lang="ts">
  import type { PageData } from './$types';
  import { Comments } from "@hyvor/hyvor-talk-svelte";
  export let data: PageData;
  import { onMount } from 'svelte';

  import Heading from '../../../components/heading.svelte';
  import Toast from '../../../components/toast.svelte';
  import { ToastType } from '$lib/models/toasttype';


  let toastComponent: Toast;
  
</script>

<svelte:head>
  <title>{data.front_matter.title}</title>
  <meta property="og:title" content={data.front_matter.title} />
  <meta property="og:description" content={data.front_matter.description} />
  <meta property="og:image" content={data.front_matter.posterImage} />
  <meta property="og:url" content={`https://devops-stuff.dev/blogs/${data.front_matter.url_postfix}`} />
  <meta property="og:type" content="article" />
</svelte:head>

<Heading />

<div class="flex flex-col items-center w-screen">
  <div id="sticky-item" class="flex flex-col items-center w-2/3 ">
    <h2 class="text-2xl font-bold mt-4 text-center">
      {data.front_matter.title}
    </h2>
    <div class="font-thin my-4 text-center">
      <div>
        Created on - {data.front_matter.created_on.toLocaleDateString()}
      </div>
      <div>
        Author('s) - {data.front_matter.authors.join(', ')}
      </div>
    </div>
    <div>
      ----------------------------------------
    </div>
  </div>
  <article id="blog-content" class="prose dark:prose-invert mt-4 mx-8 w-10/12">
    {@html data.content}
  </article>
  <article class="hidden">
    {data.content}
  </article>

  <div class="my-8">
    ----------------------------------------
  </div>

  <div class="my-8 text-2xl font-thin text-center">
    Thank you for reading my blog, <br/>
    Hope you enjoyed it. <br/>
    Please leave a comment if you have any feedback.
  </div>

  <Comments website-id={11051} page-id={`blogs/${data.front_matter.url_postfix}`} />
  <div class="fixed bottom-10 left-10 z-10">
  </div>
    <Toast bind:this={toastComponent}/>
</div>

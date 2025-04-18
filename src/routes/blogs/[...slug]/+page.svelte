<script lang="ts">
  import type { PageData } from './$types';
  import { Comments } from "@hyvor/hyvor-talk-svelte";
  export let data: PageData;
  import { onMount } from 'svelte';

  import Heading from '../../../components/heading.svelte';
  import Toast from '../../../components/toast.svelte';
  import { ToastType } from '$lib/models/toasttype';
  import { browser } from '$app/environment';
  import { addPageView, getPageViews } from '$lib/get-page-views';
  import Bottombar from '../../../components/bottombar.svelte';
  import { writable } from 'svelte/store';
  
  let toastComponent: Toast;

  let page_id = `devops-stuff.dev/blogs/${data.front_matter.url_postfix}`;
  page_id = page_id.replaceAll("/","")
  let countPromise = getPageViews(page_id);
  let localhost    = "localhost"
  let canShowToast = writable(true);

  onMount(() => {
    addEventListener("scroll", (event) => {
      let scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      console.log("Can show toast", $canShowToast);
      if (scrollPercent > 90 && $canShowToast) {
        toastComponent.invokeShowTooltip({ 
          _componentType: ToastType.INFO, 
          _message: "Thank you for reading my blog this far, Hope you enjoyed it. Please leave a comment if you have any feedback." 
        });
        canShowToast.set(false);
      }
    });
    
    let host = window.location.host;
    if (host.includes(localhost)) {
      console.log('running on localhost, adding a pageview would be cheating.');
      return;
    }
    else {
      console.log('running on production, we can add a pageview.');
      addPageView(page_id);
    }
    console.log('reloading for loading the gists properly');
  });
  
</script>

<svelte:head>
  <title>{data.front_matter.title}</title>
  <meta property="og:title" content={data.front_matter.title} />
  <meta property="og:description" content={data.front_matter.description} />
  <meta property="og:image" content={data.front_matter.ogFilePath} />
  <meta property="og:url" content={`https://devops-stuff.dev/blogs/${data.front_matter.url_postfix}`} />
  <meta property="og:type" content="article" />
</svelte:head>

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
    <div class="my-4">
      {#await countPromise}
        Loading Page count
      {:then count} 
        Page Views - {count.view_count}
      {/await}
    </div>

    <div class="css-dashes"/>
  </div>
  <article id="blog-content" class="prose dark:prose-invert mt-4 mx-8 w-10/12">
    {@html data.content}
  </article>
  <article class="hidden">
    {data.content}
  </article>

  <div class="css-dashes my-12"/>

  <div class="my-8 text-2xl font-thin text-center">
    Thank you for reading my blog, <br/>
    Hope you enjoyed it. <br/>
    Please leave a comment if you have any feedback.
  </div>

  <Comments website-id={11051} page-id={`blogs/${data.front_matter.url_postfix}`} />
  <div class="fixed bottom-10 left-10 z-10">
  </div>
  <Toast bind:this={toastComponent}/>
  <Bottombar />
</div>

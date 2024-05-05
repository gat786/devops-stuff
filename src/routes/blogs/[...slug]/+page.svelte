<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  import { onMount } from 'svelte';

  import Heading from '../../../components/heading.svelte';

  onMount(() => {
    const blogContent = document.getElementById('blog-content');
    if (blogContent != null) {
      blogContent.innerHTML = data.content;
    }
  });

</script>

<head>
  <title>{data.front_matter.title}</title>
</head>

<Heading />

<div class="flex flex-col items-center w-screen">
  <div class="flex flex-col items-center w-2/3">
    <h2 class="text-2xl font-bold mt-4">
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
  <article id="blog-content" class="prose dark:prose-invert mt-4">
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

  <script defer src="https://cdn.commento.io/js/commento.js"></script>
  <div class="w-1/2">
    <div id="commento"></div>
  </div>
</div>

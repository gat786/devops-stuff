<script lang="ts">
    import Heading from "../../components/heading.svelte";
    import type { PageData } from "./$types";
    export let data: PageData;
</script>
<Heading/>

<svelte:head>
  <title>Content Policy for Devops-Stuff Website</title>
</svelte:head>

<div class="flex flex-col items-center mx-8 my-8">
  <h1 class="text-2xl font-semibold py-4">
    Content-Policy
  </h1>

  <article class="prose dark:prose-invert mt-4">
    <p>
      All the content present on this website is available for free use and 
      distribute. And I chose it to open-source using the MIT-License as below 👇
    </p>
    {@html data.license}

    <p>
      All the content present on this website can be found as a part of a
      single git repository that is present <a href="https://github.com/gat786/devops-stuff">here</a>
    </p>

    <p>
      Note - The logo used on this website is a logo bought from
      <a href="https://thenounproject.com/creator/Runouns/">The Noun-Project</a>.
    </p>
  </article>
</div>

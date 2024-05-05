<header>
	<title>Devops Stuff</title>
</header>

<Heading />

<ul class="text-center font-medium my-12 gap-4 flex-row">
  <li>
    <a href="/blogs">
      Blogs
    </a>
  </li>
  <li>
    <a href="/videos">
      Videos
    </a>
  </li>
  <li>
    <a href="/projects">
      Projects
    </a>
  </li>
</ul>

<style>
  li::before {
    content: '- ';
  }

  li:hover {
    color: #f59e0b;
    cursor: pointer;
  }
</style>

<script lang="ts">
  import Heading from "../components/heading.svelte";
</script>

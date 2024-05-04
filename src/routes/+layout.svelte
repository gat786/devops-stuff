<script>
	import "../app.css";
	import ThemeSwitch from "../components/theme-switch.svelte";"../components/theme-switch.svelte";
</script>

<title>Devops Stuff</title>


<div class="dark:bg-slate-700 bg-slate-200">
	<ThemeSwitch/>
	<slot/>
</div>

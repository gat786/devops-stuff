<script>
	import "../app.css";
	import ThemeSwitch from "../components/theme-switch.svelte";
	import Footer from "../components/footer.svelte";
</script>

<div>
	<div class="fixed top-0 right-0 m-4">
		<ThemeSwitch/>
	</div>
	<slot/>
	<div class="fixed bottom-0 right-0 m-4">
		by Ganesh Tiwari
	</div>
</div>
<div class="flex flex-col items-center">
	<Footer/>
</div>

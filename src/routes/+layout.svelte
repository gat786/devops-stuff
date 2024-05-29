<script lang="ts">
	import "../app.css";
	import ThemeSwitch from "../components/theme-switch.svelte";
	import XMark from "../lib/icons/x-mark.svelte";
	import Footer from "../components/footer.svelte";
  import { afterUpdate, onMount } from "svelte";

	let showZoomyImage = false;
	let imageUrlToShow: String | null = null;

	afterUpdate(() => {
		const article = document.getElementsByTagName("article");
		
		for(let i = 0; i < article.length; i++) {
			let currentArticle = article.item(i);
			if (currentArticle?.id == "blog-content"){
				let zoomableImages = currentArticle.getElementsByTagName("img");
				for (let j = 0; j < zoomableImages.length; j++){
					let currentImage = zoomableImages.item(j);
					currentImage?.classList.add("zoomable");
					currentImage?.addEventListener("click", (onMouseEvent) => {
						showZoomyImage = true;
						imageUrlToShow = currentImage.src;
					})
				}				
			}
		}
	})

</script>

<div>
	{#if showZoomyImage}
		<div class="fixed z-30 bg-black bg-opacity-80 h-full w-full">
			<button 
				class="text-white z-50 top-10 right-10 fixed"
				on:click={() => {
					showZoomyImage = false;
				}}>
				<XMark/>
			</button>
			{#if (imageUrlToShow != null)}
			<div class="z-40 h-screen flex items-center justify-center">
				<img
					src={imageUrlToShow.toString()}
					alt="currently zoomed"
					class=""/>
			</div>
			{/if}
			
		</div>
	{/if}
	
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

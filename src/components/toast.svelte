<script lang="ts">
  import ErrorIcon from "$lib/icons/ui/error.svelte";
  import InfoIcon from "$lib/icons/ui/info.svelte";
  import SuccessIcon from "$lib/icons/ui/success.svelte";
  import WarningIcon from "$lib/icons/ui/warning.svelte";
  import { ToastType } from "$lib/models/toasttype";
  import { onMount } from "svelte";

  export let componentType: ToastType = ToastType.INFO;

  let styles = "";
  let showTooltip = false;

  export const invokeShowTooltip = () => {
    console.log("Tooltip will be shown");
    showTooltip = true;

    setTimeout(() => {
      showTooltip = false;
    }, 3000);
  };

  onMount(() => {
    setTimeout(() => {
      console.log("I will be disabled now");
    }, 3000);

    //  set styles based on componentType
    switch (componentType) {
      case ToastType.INFO:
        styles = "text-white bg-gray-800 dark:bg-white dark:text-gray-800";
        break;
      case ToastType.SUCCESS:
        styles = "bg-black dark:bg-white text-green-500";
        break;
      case ToastType.ERROR:
        styles = "bg-red-500 text-white dark:bg-white dark:text-red-500";
        break;
      case ToastType.WARNING:
        styles = "bg-orange-500 text-white dark:bg-white dark:text-orange-500";
        break;
    }
  });
</script>

<div class={`fixed transition-all ${showTooltip ? "show" : "hide"}`}>
  <div class={`rounded-lg px-4 py-2 flex gap-2 ${styles}`}>
    {#if componentType === ToastType.INFO}
      <InfoIcon />
    {/if}
    {#if componentType === ToastType.SUCCESS}
      <SuccessIcon />
    {/if}
    {#if componentType === ToastType.ERROR}
      <ErrorIcon />
    {/if}
    {#if componentType === ToastType.WARNING}
      <WarningIcon />
    {/if}
    Hi I am a toast
  </div>
</div>

<style>
  .show {
    top: 5%;
  }

  .hide {
    top: -5%;
  }
</style>

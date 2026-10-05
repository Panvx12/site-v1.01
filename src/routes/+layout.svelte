<script>
	import icon from '$lib/assets/icon.webp';
    import  Navigation  from '$lib/components/Navigation.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	afterNavigate(() => {
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });
    });
</script>

<svelte:head>
	<link rel="icon" href={icon} />
</svelte:head>

<main>
	<!--this section combine marquee and nav,and marquee is on nav-->
		<section class="marqueeCombineNav">
			<Marquee />
			<Navigation />
		</section>
	{@render children()}
</main>

<style>
	.marqueeCombineNav {
		margin: auto;
		width: min(var(--initContentWidth),var(--maxContentWidth));
        position: sticky;
        top: 0;
        z-index: var(--zLargestIndex);
	}
</style>
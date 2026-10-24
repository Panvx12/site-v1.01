<script>
	import Loading from '#lib/components/Loading.svelte';
    import  Navigation  from '#lib/components/Navigation.svelte';
	import Marquee from '#lib/components/Marquee.svelte';
	import icon from '#lib/assets/icon.webp';
	
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	// 刷新頁面統一從最上面開始
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
	<Loading />
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
        top: 0;
        z-index: var(--zLargestIndex);
	}
</style>
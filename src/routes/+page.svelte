<script>
	import Banner from '#lib/components/Banner.svelte';
	import Profile from '#lib/components/Profile.svelte';
	import Progress from '#lib/components/Progress.svelte';
	import Footer from '#lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>鬆餅官方網站 | HOME</title>
</svelte:head>

<main>
	<Banner />
	<section class="content">
		<h1>PROFILE</h1>
		<p class="annotation">// 個人檔案</p>
		<Profile />

		<h1>IN PROGRESS</h1>
		<p class="annotation">// 專案開發</p>
		<Progress />
	</section>
	<Footer />
</main>

<style>
	h1 {
		margin: 20px 0 0 0;
		color: black;
		font-size: 4rem;
		font-weight: bold;
		text-shadow: 0 0 3px rgba(102, 103, 103, 0.8);
	}
	.content {
		margin: auto;
		padding: 0 min(7svw, 100px);
		width: min(100svw, var(--maxContentWidth));
	}
	.annotation {
		margin: 0 0 20px 0;
		color: var(--silver);
		font-size: 1.5rem;
	}

	@media (max-width: 1100px) {
		h1 {
			font-size: 2.5rem;
		}
	}
</style>

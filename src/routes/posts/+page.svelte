<script>
    import PostsList from "#lib/components/PostsList.svelte";
</script>

<svelte:head>
    <title>鬆餅官方網站 | POSTS</title>
</svelte:head>

<section class="content">
    <h1>POSTS</h1>
    <p class="annotation">// 各類文章</p>
    <PostsList />
</section>

<style>
    h1 {
        margin: 20px 0 0 0;
        color: black;
        font-size: 4rem;
        font-weight: bold;
        /* text-shadow syntax: X-axis offset Y-axis offset blur radius shadow color */
        text-shadow: 0 0 3px  rgba(102, 103, 103, 0.8);
    }
    .content {
        padding: 0 min(7svw,100px);
        margin: auto;
        width: min(var(--initContentWidth),var(--maxContentWidth));
    }
    .annotation {
        margin: 0 0 40px 0;
        color: var(--silver);
        font-size: 1.5rem;
    }
    @media (max-width: 1100px) {
        h1 {
            font-size: 2.5rem;
        }
    }
</style>
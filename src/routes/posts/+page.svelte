<script>
    import PostsList from "$lib/components/PostsList.svelte";
</script>

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
        text-shadow: 0 0 3px  rgba(102, 103, 103, 0.8);
    }
    .content {
        padding: 50px 50px 0 50px;
        margin: auto;
        width: min(var(--initContentWidth),var(--maxContentWidth));
    }
    .annotation {
        margin: 0 0 40px 0;
        color: var(--sliver);
        font-size: 1.5rem;
    }
</style>
<script>
    import GiscusComments from '#lib/components/GiscusComments.svelte';
    /** @type {import('./$types').PageProps} */
    let { data } = $props();
    let ContentComponent = $derived(data.content);
</script>

<section class="content">
    <article>
        <h1>{data.metadata?.title || '未命名文章'}</h1>
        <hr>
        {#if ContentComponent}
            <ContentComponent />
        {:else}
            <p>找不到文章內容</p>
        {/if}
    </article>
    <div class="comments">
        <GiscusComments />
    </div>
</section>

<style>
    h1 {
        width: fit-content;
        margin: auto;
        overflow-wrap: break-word;
        white-space: nowrap;
        font-weight: 700;
        font-size: 1.5rem;
    }
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin: auto;
        padding: 10px 20px 0 20px;
        width: min(100svw,var(--maxContentWidth))
    }
    article {
        padding: 10px 10px 0 10px;
        width: 50%;
        overflow-wrap: break-word;
    }
    .comments {
        padding: 10px 10px 0 10px;
        width: 50%;
    }
    :global(blockquote) {
        margin: 1rem 0;
        padding-left: 15px;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        border-left: 4px solid #6b7794;
        color: #475063;
        background-color: #f3f4f6;
    }

    @media (max-width: 1100px) {
        article {
            width: 100%;
        }
        .comments {
            width: 100%;
        }
    }
</style>
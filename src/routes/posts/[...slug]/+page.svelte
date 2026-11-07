<script>
    import GiscusComments from '#lib/components/GiscusComments.svelte';
    /** @type {import('./$types').PageProps} */
    let { data } = $props();
    let ContentComponent = $derived(data.content);
</script>

<section class="content">
    <article>
        <div class="meta">
            <h1>{data.metadata?.title || "unknown"}</h1>
            <p>Author: {data.metadata?.author || "anonymous"}</p>
            <p>Date: {data.metadata?.date || "unknown"}</p>
            <div>
            <span>Tags: </span>
                <span>{data.metadata?.tags?.join(', ') || "unknown"}</span>
            </div>
        </div>
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
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin: auto;
        padding: 10px 20px 0 20px;
        width: min(100svw,var(--maxContentWidth))
    }

    article{
        padding: 10px 10px 0 10px;
        width: 70%;
        overflow-wrap: break-word;
    }
    article :global(h2) {
        font-weight: 700;
        font-size: 1.25rem;
        margin-top: 20px;
        margin-bottom: 5px;
    }
    article :global(p) {
        margin: 5px 0;
    }
    article :global(ul) {
        list-style: none;
        margin: 0;
        padding-left: 0;
    }
    article :global(ul > li) {
        position: relative;
        padding-left: 10px;
    }
    article :global(ul > li::before) {
        content: "›";
        position: absolute;
        left: 0;
    }
    /* Markdown 程式碼區塊 (Code Block) 樣式 */
    article :global(pre) {
        background-color: #f6f8fa;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 12px 16px;
        overflow-x: auto;
        margin: 10px 0;
    }
    article :global(pre)::-webkit-scrollbar {
        height: 3px; /* 降低滑條高度 */
    }
    article :global(pre code) {
        font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        font-size: 0.9rem;
        line-height: 1.45;
        color: #24292f;
    }
    article :global(:not(pre) > code) {
        background-color: #afb8c133;
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 85%;
    }

    .meta {
        p {
            margin: 0;
        }
        h1 {
            width: fit-content;
            margin: auto;
            margin-bottom: 10px;
            font-weight: 700;
            font-size: 1.5rem;
            overflow-wrap: break-word;
        }
    }

    .comments {
        width: 70%;
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
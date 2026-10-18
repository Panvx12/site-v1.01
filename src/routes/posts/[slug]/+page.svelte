<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<section class="content">
    <article>
        {#if data.meta.title}
            <h1>{data.meta.title}</h1>
        {/if}
        <hr />
        <svelte:component this={data.content} />
    </article>
</section>

<style>
    .content {
        margin: auto;
        padding: 50px 50px 0 50px;
        width: min(100svw,var(--maxContentWidth))
    }
    article {
        width: 60%;
        overflow-wrap: break-word;
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
    @media(max-width: 1100px) {
        article {
            width: 100%;
        }
    }
</style>
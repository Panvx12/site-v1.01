<script>
    import { onMount } from 'svelte';

    /** @type {HTMLDivElement | null} */
    let commentContainer = null;

    onMount(() => {
        const scriptEl = document.createElement('script');
        scriptEl.src = 'https://giscus.app/client.js';
        
        scriptEl.setAttribute("data-repo", "Panvx12/site-v1.01");
        scriptEl.setAttribute("data-repo-id", "R_kgDOU84wkA");
        scriptEl.setAttribute("data-category", "General");
        scriptEl.setAttribute("data-category-id", "DIC_kwDOU84wkM4DI_oD");
        scriptEl.setAttribute("data-mapping", "pathname");
        scriptEl.setAttribute("data-strict", "0");
        scriptEl.setAttribute("data-reactions-enabled", "1");
        scriptEl.setAttribute("data-emit-metadata", "0");
        scriptEl.setAttribute("data-input-position", "top");
        scriptEl.setAttribute("data-theme", "light");
        scriptEl.setAttribute("data-lang", "zh-TW");
        scriptEl.setAttribute("data-loading", "lazy");
        scriptEl.crossOrigin = "anonymous";
        scriptEl.async = true;

        if (commentContainer) {
            commentContainer.appendChild(scriptEl);
        } else {
            document.body.appendChild(scriptEl);
        }
    });
</script>

<div bind:this={commentContainer} class="giscus-wrapper"></div>

<style>
    .giscus-wrapper {
        margin: 0 5px;
        width: 100%;
    }
</style>
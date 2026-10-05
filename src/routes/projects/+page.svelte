<script>
    import ProjectColumn from "$lib/components/ProjectColumn.svelte";
</script>

<svelte:head>
    <title>鬆餅官方網站 | PROJECTS</title>
</svelte:head>

<main>
    <section class="content">
        <h1>PROJECTS</h1>
        <p class="annotation">/ / 專案成果</p>
        <ProjectColumn />
    </section>
</main>

<style>
    h1 {
        margin: 0;
        color: black;
        font-size: 4rem;
        font-weight: bold;
        /* text-shadow 語法：X軸偏移 Y軸偏移 模糊半徑 陰影顏色 */
        text-shadow: 0 0 3px  rgba(102, 103, 103, 0.8);
    }
    .content {
        padding: 50px;
        margin: auto;
        width: min(var(--initContentWidth),var(--maxContentWidth));
    }
    .annotation {
        margin: 0 0 40px 0;
        color: rgb(74, 74, 74);
        font-size: 1.5rem;
    }
    @media (max-width: 1100px) {
        h1 {
            font-size: 2.5rem;
        }
    }
</style>
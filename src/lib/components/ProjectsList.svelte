<script>
    import items from '$lib/dataset/projects.json'
</script>

<div class="projects-list">
    {#each items as item}
        <a class="link" href="{item.link}">
            <div class="column">
                <div class="header">
                    <span class="arrow">→</span>
                    <span class="time">{item.time}</span>
                    <span class="type" style="color:{item.tColor}">{item.type}</span>
                    <span class="title">{item.title}</span>
                </div>
                <div class="end">
                    <span class="status">{item.status}</span>
                </div>
            </div>
        </a>
    {/each}
</div>

<style>
    .projects-list {
        margin: auto;
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--sliver);
        border-left: 1px solid var(--sliver);
        border-right: 1px solid var(--sliver);
        width: 95%;
    }
    .link {
        color: inherit;
        text-decoration: none;
    }
    .column {
        min-height: 50px;
        margin: auto;
        padding: 5px 10px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        background-color: white;
        border-bottom: 1px solid var(--sliver);
    }
    .column:hover {
        background-color: aliceblue
    }
    .header {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 20px;
    }
    .header::after {
        content: "";
        display: flex;
        flex: 1;
        height: 1px;
        border-bottom: 1px dashed var(--sliver);
    }
    .end {
        margin-left: 20px;
        display: flex;
        align-items: center;
    }
    .time {
        margin: 0;
        color: var(--sliver);
    }
    .type {
        margin: 0;
        font-weight: 700;
    }
    .title {
        margin: 0;
        font-weight: 700;
    }
    .status {
        color: var(--sliver);
    }
    @media (max-width: 800px) {
        .header::after {
            display: none;
        }
        .end {
            display: none;
        }
        .projects-list {
            width: 100%;
        }
        .column {
            min-height: 35px;
        }
        .arrow {
            font-size: 0.5rem;
        }
        .time {
            font-size: 0.8rem;
        }
        .type {
            display: none;
        }
        .title {
            font-size: 0.8rem;
        }
        .status {
            font-size: 0.8rem;
        }
    }
</style>
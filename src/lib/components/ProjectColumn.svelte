<script>
    import items from '$lib/dataset/projects.json'
</script>

<div class="projects-list">
    {#each items as item}
        <a class="link" href="{item.link}">
            <div class="column">
                <div class="header">
                    <p class="arrow">→</p>
                    <p class="time">{item.time}</p>
                    <p class="type">{item.type}</p>
                    <p class="title">{item.title}</p>
                </div>
                <div class="end">
                    <p class="status">{item.status}</p>
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
        width: 80%;
    }
    .link {
        text-decoration: none;
    }
    .column {
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
        flex-direction: row;
        align-items: center;
        flex: 1;
        gap: 20px;
    }
    .header::after {
        content: "";
        flex: 1;
        height: 0;
        border-bottom: 1px dashed rgb(74, 74, 74);
    }
    .end {
        margin-left: 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px;
    }
    .arrow {
        color: black;
    }
    .time {
        margin: 0;
        color: var(--sliver);
    }
    .type {
        margin: 0;
        font-weight: 700;
        color: black;
    }
    .title {
        margin: 0;
        font-weight: 700;
        color: black;
    }
    .status {
        margin: 0;
        color: var(--sliver);
    }
    @media (max-width: 800px) {
        .projects-list {
            width: 100%;
        }
        .header {
            gap: 10px;
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
            display: none;
        }
        .header::after {
            display: none;
        }
    }
</style>
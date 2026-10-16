<script>
    import items from '$lib/dataset/projects.json'
</script>

{#each items as item}
    <a class="link" href="{item.link}">
        <div class="column">
            <div class="header">
                <p>→</p>
                <p class="time">{item.time}</p>
                <p class="type">{item.type}</p>
                <p class="title">{item.title}</p>
            </div>
            <div class="end">
                <p class="status">{item.status}</p>
                <p>←</p>
            </div>
        </div>
    </a>
{/each}

<style>
    .link {
        text-decoration: none;
    }
    .column {
        margin: auto;
        margin-bottom: 10px;
        padding: 5px 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        background-color: aliceblue;
    }
    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        background-color: aliceblue;
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
        justify-content: space-between;
        background-color: aliceblue;
        gap: 20px;
    }
    .time {
        color: rgb(74, 74, 74);
    }
    .type {
        font-weight: 700;
        color: black;
    }
    .title {
        font-weight: 700;
        color: black;
    }
    .status {
        color: rgb(74, 74, 74);
    }
</style>
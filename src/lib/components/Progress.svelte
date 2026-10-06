<script>
    import items from "$lib/dataset/in-progress.json";
</script>

<section>
    {#each items as item}
        <div class="progress">
            <div class="card-header">
                <h1>{item.title}</h1>
                <span class="badge">{item.status} {item.progress}</span>
            </div>
            <p class="description">{item.description}</p>
            <div class="tech-tags">
                {#each item.techStack as tech}
                    <span class="tag">{tech}</span>
                {/each}
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: {item.progress};"></div>
            </div>
        </div>
    {/each}
</section>

<style>
    .progress {
        margin: 20px auto;
        width: 90%;
        height: fit-content;
        border: 1px solid #333;
        padding: 20px;
        background-color: #fff;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 12px;
    }
    .progress h1 {
        display: inline-block;
        margin: 0;
        font-size: 1.5rem;
        color: #1a1a1a;
    }

    .badge {
        font-size: 0.85rem;
        padding: 4px 10px;
        font-weight: 600;
        background-color: #e3f2fd;
        color: #1976d2;
    }

    .description {
        margin: 0 0 16px 0;
        color: #555;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    .tech-tags {
        display: flex;
        width: 60%;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }
    .tag {
        background-color: #f5f5f5;
        color: #333;
        font-size: 0.8rem;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
    }
    .tag:hover {
        cursor: pointer;
    }

    .progress-bar-container {
        width: 100%;
        height: 8px;
        background-color: #eee;
        border-radius: 4px;
        overflow: visible;
    }
    .progress-bar {
        height: 100%;
        background: #00f2fe;
        box-shadow: 0 0 5px #00f2fe;
        border-radius: 4px;
    }
</style>
<script>
    import items from "$lib/posts/posts.json";
    import { base } from '$app/paths';
</script>

<div class="posts-list">
    {#each items as item}
        <a class="link" href="./posts/{item.slug}">
            <div class="column">
                <span class="arrow">→</span>
                <span class="time">{item.time}</span>
                <span class="type" style="color:{item.tColor};">{item.type}</span>
                <span class="title">{item.title}</span>
            </div>
        </a>
    {/each}
</div>

<style>
    .posts-list {
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
        align-items: center;
        gap: 20px;
        background-color: white;
        border-bottom: 1px solid var(--sliver);
    }
    .column:hover {
        background-color: aliceblue
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
    @media (max-width: 800px) {
        .posts-list {
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
    }
</style>
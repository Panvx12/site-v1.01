<script>
    import items from "$lib/dataset/projects.json";
</script>

<section class="container">
    {#each items as item}
        <div class="column">
            <h1>{item.title}</h1>
            <h2>{item.summary}</h2>
            <span class="status" style="background-color: {item.sColor}">{item.status}</span>
            <div class="content">
                <p class="content">{item.content}</p>
                <p class="notice">{item.notice}</p>
                <a class="source" href={item.link} target="_blank">SOURCE</a>
            </div>
        </div>
    {/each}
</section>

<style>
    h1, h2{ 
        margin: 0 0 10px 0;
    }
    .container {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 16px;
    }
    .column {
        padding: 30px;
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background-color: aliceblue;
    }
    .status {
        display: inline-block;
        margin: 0 0 10px 0;
        padding: 3px 10px;
        color: black;
        font-weight: 600;
        border-radius: 9999px;
    }
    .status:hover {
        cursor: pointer;
    }
    .content {
        margin: 0 0 10px 0;
    }
    .notice{
        margin-bottom: 20px;
        color: red;
        text-shadow: 0 0 10px red;
    }
    .source {
        padding: 6px 14px;
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 6px;
        text-decoration: none;
        font-size: 1.2rem;
        font-weight: 500;
    }
    @media (max-width: 1100px) {
        .container {
            grid-template-columns: 1fr;
        }
    }
</style>
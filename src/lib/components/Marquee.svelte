<!--
    this component provide the marquee.
    -> flex box
    -> fetch data from "lib/dataset/marquee.json"
    -> width limit in special range(var,var)
-->

<script>
	import items from '#lib/dataset/marquee.json';
</script>

<section class="marquee">
    <div class="marquee-track">
        <div class="content">
            {#each items as item}
                <span>{@html item}</span>
            {/each}
        </div>
    </div>
</section>

<style>
    .marquee {
        width: min(var(--initContentWidth), var(--maxContentWidth));
        height: 30px;
        display: flex;
        align-items: center;
        border-width: 0;
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        overflow: hidden;
        white-space: nowrap;
    }
    .marquee-track {
        display: inline-flex;
        transform: translateX(100%);
        animation: seamless-marquee 60s linear infinite;
    }
    .content {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 2rem;
        font-size: 1rem;
    }
    .marquee .content span {
        color: var(--sliver);
    }
    @keyframes seamless-marquee {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-100%);
        }
    }
</style>
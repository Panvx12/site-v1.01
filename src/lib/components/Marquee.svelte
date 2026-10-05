<!--
    this component provide the marquee.
    -> flex box
    -> fetch data from "lib/dataset/marquee.json"
    -> width limit in special range(var,var)
-->

<script>
	import items from '$lib/dataset/marquee.json';
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
        border-top: 1px solid var(--BorderColorW);
        border-bottom: 1px solid var(--BorderColorW);
        background-color: rgb(53, 53, 53);
        overflow: hidden;
        white-space: nowrap;
    }
    .marquee-track {
        display: inline-flex;
        transform: translateX(100%);
        animation: seamless-marquee 60s linear infinite;
    }
    .marquee-track:hover {
        cursor: pointer;
        animation-play-state: paused;
    }
    .content {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 2rem;
        font-size: 1rem;
    }
    .marquee .content span {
        color: rgb(220, 220, 220);
    }
    @keyframes seamless-marquee {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-100%);
        }
    }

    @media (max-width: 768px) {
        
    }
</style>
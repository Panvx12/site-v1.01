<script>
    import identityCard from "#lib/dataset/identityCard.json";
    import skills from "#lib/dataset/skills.json";
</script>

<section class="banner">
    <div class="content">
        <div class="idc">
            <div class="left-up-decoration"></div>
            <div class="right-up-decoration"></div>
            <div class="left-down-decoration"></div>
            <div class="right-down-decoration"></div>

            <p class="annotation">// IDENTITY CARD</p>
            <h1>鬆餅</h1>
            <h2>WAFFLE / PANCAKE</h2>
            <div class="idc-divider"> </div>
            <div class="idc-info">
                {#each identityCard as item}
                    <div class="idc-row"><dt>{item.label}</dt><dd>{item.value}</dd></div>
                {/each}
            </div>
        </div >
        <div>
            <div class="brief">
                <div class="left-up-decoration"></div>
                <div class="right-up-decoration"></div>
                <div class="left-down-decoration"></div>
                <div class="right-down-decoration"></div>

                <p class="annotation">// BRIEF</p>
                <p style="font-size: 14px; margin: 0;">A university student from Taiwan, focused on programming and curious about new technologies.</p>
            </div>
            <div class="skills">
                <div class="left-up-decoration"></div>
                <div class="right-up-decoration"></div>
                <div class="left-down-decoration"></div>
                <div class="right-down-decoration"></div>

                <p class="annotation">// SKILLS</p>
                {#each skills as skill}
                    <span class="skill-box">{skill}</span>
                {/each}
            </div>
        </div>
    </div>
</section>

<style>
    .left-up-decoration {
        position: absolute;
        top: 0;
        left: 0;
        width: 10px;
        height: 10px;
        border-left: 2px solid blue;
        border-top: 2px solid blue;
    }
    .right-up-decoration {
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-right: 2px solid blue;
        border-top: 2px solid blue;
    }
    .left-down-decoration {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 10px;
        height: 10px;
        border-left: 2px solid blue;
        border-bottom: 2px solid blue;
    }
    .right-down-decoration {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-right: 2px solid blue;
        border-bottom: 2px solid blue;
    }


    .banner {
        margin: auto;
        position: relative;
        width: min(100svw,var(--maxContentWidth));
        height: 700px;

        background-image: url(../../../src/lib/assets/cover0.webp);
        background-size: cover;
        background-position: left top;
        background-repeat: no-repeat;
    }

    .content {
        width: 50%;
        position: absolute;
        top: 12%;
        left: 40%;
        display: grid;
        grid-template-columns: 280px 240px 1fr;
        grid-template-rows: 1fr;
        gap: 20px;
    }
    .annotation {
        margin: 5px 0;
        color: var(--sliver);
    }
    .idc {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #ffffffc7, #f1f4fbb3);
    }
    .idc-divider {
        margin: 15px 0 10px 0;
        width: 100%;
        height: 1px;
        background-color: rgba(0, 0, 0, 0.3);
    }
    .idc-info {
        width: 100%;
    }
    .idc h1 {
        display: block;
        width: fit-content;
        margin: 0 auto;
        font-size: 38px;
        font-weight: bold;
        text-shadow: 0 0 10px  rgba(102, 103, 103, 0.8);
    }
    .idc h2 {
        display: block;
        width: fit-content;
        margin: 0 auto;
        font-size: 14px;
        font-weight: normal;
        color: #1d4ed8;
    }
    .idc-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 5px;
    }
    .idc dt {
        display: flex;
        flex: 1;
        align-items: center;
        margin: 0;
        color: rgba(0, 0, 0, 0.5);
    }
    .idc dd {
        max-width: 60%;
        margin: 0;
        font-weight: normal;
    }
    .idc dt::after {
        content: "";
        flex: 1;
        margin: 0 10px;
        border-bottom: 2px dashed rgba(138, 138, 138, 0.3);
    }
    .brief {
        position: relative;
        margin-bottom: 20px;
        padding: 10px;
        background: linear-gradient(135deg, #ffffffc7, #f1f4fbb3);
    }
    .skills {
        position: relative;
        padding: 10px;
        background: linear-gradient(135deg, #ffffffc7, #f1f4fbb3);
    }
    .skill-box {
        display: inline-block;
        margin: 5px 2px;
        padding: 5px 7px;
        background: rgb(0, 0, 0);
        border: 1px solid rgba(0, 0, 0, 0.3);
        color: rgb(255, 255, 255);
        font-size: 14px;
    }
    .skill-box:hover {
        cursor: pointer;
        background: rgb(255, 255, 255);
        color: rgb(0, 0, 0);
    }

    @media (max-width: 1100px) {
        .banner {
            height: 900px;
            background-image: url(../../../src/lib/assets/cover1.webp);
            background-position: center top;
        }

        .content {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(2, 1fr);
            width: 80%;
            top: 20%;
            left: 10%;
        }
        .idc {
            font-size: 0.7rem;
        }
        .brief {
            font-size: 0.7rem;
        }
        .skills {
            font-size: 0.7rem;
        }
        .skill-box {
            font-size: 0.7rem;
        }
    }
</style>
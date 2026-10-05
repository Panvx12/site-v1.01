<svelte:head>
    <title>鬆餅官方網站 | HOME</title>
</svelte:head>

<script>
    import IndentityCard from '$lib/components/IdentityCard.svelte';
    import Profile from '$lib/components/Profile.svelte';
    import Progress from '$lib/components/Progress.svelte';
    import Footer from '$lib/components/Footer.svelte';

    import avatar from "$lib/assets/avatar1.webp";
</script>

<main>
    <IndentityCard />
    <section class="content">
        <h1>PROFILE</h1>
        <p class="annotation">// 個人簡介</p>
        <Profile />

        <h1>AVATAR</h1>
        <p class="annotation">// 虛擬形象</p>
        <img class="avatar" src= {avatar} alt="avatar">

        <h1>IN PROGRESS</h1>
        <p class="annotation">// 專案開發</p>
        <Progress />
    </section>
    <Footer />
</main>

<style>
    h1 {
        margin: 20px 0 0 0;
        color: black;
        font-size: 4rem;
        font-weight: bold;
        /* text-shadow 語法：X軸偏移 Y軸偏移 模糊半徑 陰影顏色 */
        text-shadow: 0 0 3px  rgba(102, 103, 103, 0.8);
    }
    .content {
        margin: auto;
        padding: 50px 50px 0 50px;
        width: min(100svw,var(--maxContentWidth))
    }
    .annotation {
        margin: 0 0 20px 0;
        color: rgb(74, 74, 74);
        font-size: 1.5rem;
    }
    .avatar {
        display: block;
        margin: auto;
        width: 80%;
    }
    @media (max-width: 1100px) {
        h1 {
            font-size: 2.5rem;
        }
    }
</style>
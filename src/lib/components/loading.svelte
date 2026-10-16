<script>
    import Logo from '$lib/assets/logo1.webp'
</script>

<section class="loading">
    <div class="content">
        <img class="logo" src={Logo} alt="logo">
        <div class="progress-bar-container"><div class="progress-bar"></div></div>
    </div>
</section>

<style>
    .loading {
        display: flex;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        align-items: center;
        justify-content: center;
        background-color: white;
        animation: hideLoading 0.5s ease-in-out 2s forwards;
    }
    .content {
        max-width: 200px;
        width:60%;
    }
    .logo {
        margin: auto;
        width: 100%;
    }
    .progress-bar-container {
        margin: auto;
        margin-top: 20px;
        width: 100%;
        height: 6px;
        background-color: #f3f3f3;
        border-radius: 5px;
    }
    .progress-bar {
        width: 0%;
        height: 100%;
        background: #00f2fe;
        box-shadow: 0 0 5px #00f2fe;
        border-radius: 5px;
        animation: loading 2s ease-in-out;
    }

    @keyframes loading {
        0% {
            width: 0%;
        }
        100% {
            width: 100%;
        }
    }
    @keyframes hideLoading {
        0% {
            opacity: 1;
        }
        99% {
            opacity: 0;
        }
        100% {
            opacity: 0;
            visibility: hidden;
            display: none;
        }
    }
</style>
<script>
    import Contact from "#lib/dataset/contact.json";
    import avatar from "#lib/assets/avatar.webp";
</script>

<section class="profile">
    <div class="self">
        <div class="left-up-decoration"></div>
        <div class="right-up-decoration"></div>
        <div class="left-down-decoration"></div>
        <div class="right-down-decoration"></div>

        <img class="avatar" src= {avatar} alt="avatar" />
        <h1>鬆餅</h1>
        <p class="annotation">WAFFLE / PANCAKE</p>
        <p>
            I am a university student from Taiwan, currently studying Electrical Engineering at National Formosa University.
            I have a strong interest in programming and software development.
            I enjoy learning new technologies through hands-on projects and practical experience.
        </p>
        <span class="tag-box">STUDENT</span>
        <span class="tag-box">EE</span>
        <span class="tag-box">LEARNING</span>
        <span class="tag-box">CODE</span>
    </div>
    <div class="other">
        <div class="contact">

            <div class="left-up-decoration"></div>
            <div class="right-up-decoration"></div>
            <div class="left-down-decoration"></div>
            <div class="right-down-decoration"></div>

            <h1>CONTACT</h1>
            {#each Contact as contact}
                <div class="contact-item">
                    <p>{contact.platform}</p>
                    <a href={contact.link} target="_blank">{contact.username}</a>
                </div>
            {/each}
        </div>
        <div class="code-box">
            <div class="left-up-decoration"></div>
            <div class="right-up-decoration"></div>
            <div class="left-down-decoration"></div>
            <div class="right-down-decoration"></div>

            <p>#include &lt;stdio.h&gt;</p>
            <p>typedef struct &lbrace;</p>
            <p>&nbsp&nbsp&nbsp&nbsp;char name[10];</p>
            <p>&nbsp&nbsp&nbsp&nbsp;char role[20];</p>
            <p>&rbrace; Profile;</p>
            <p>int main() &lbrace;</p>
            <p>&nbsp&nbsp&nbsp&nbsp;Profile me = &lbrace;"WAFFLE","STUDENT @ NFUEE"&rbrace;</p>
            <p>&nbsp&nbsp&nbsp&nbsp;printf("%s %s", me.name, me.role);</p>
            <p>&nbsp&nbsp&nbsp&nbsp;return 0;</p>
            <p>&rbrace;</p>
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
        border-left: 1px solid blue;
        border-top: 1px solid blue;
    }
    .right-up-decoration {
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-right: 1px solid blue;
        border-top: 1px solid blue;
    }
    .left-down-decoration {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 10px;
        height: 10px;
        border-left: 1px solid blue;
        border-bottom: 1px solid blue;
    }
    .right-down-decoration {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-right: 1px solid blue;
        border-bottom: 1px solid blue;
    }

    .profile {
        margin: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        gap: 20px;
        width: 70%;
    }
    .annotation {
        margin: 0 0 5px 0;
        color: var(--sliver);
        font-size: 1rem;
    }
    .self {
        position: relative;
        padding: 20px;
        overflow-wrap: break-word;
    }
    .self h1 {
        margin: 0;
        color: black;
        font-size: 1.5rem;
        font-weight: bold;
    }
    .tag-box {
        display: inline-block;
        margin: 5px 2px;
        padding: 5px 7px;
        background: rgb(0, 0, 0);
        border: 1px solid rgba(0, 0, 0, 0.3);
        color: rgb(255, 255, 255);
        font-size: 14px;
    }
    .tag-box:hover {
        cursor: pointer;
        background: rgb(255, 255, 255);
        color: rgb(0, 0, 0);
    }
    .other {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 20px;
    }
    .code-box {
        position: relative;
        padding: 20px;
        background: linear-gradient(135deg, #f4f6fb, #e5ebf6);
        font-family: 'Fira Code', 'Consolas', monospace;
    }
    .code-box p {
        margin: 0;
    }
    .contact {
        position: relative;
        padding: 20px;
        overflow-wrap: break-word;
    }
    .contact h1 {
        margin: 0 0 20px 0;
    }
    .contact-item {
        margin: 0 0 5px 0;
        display: grid;
        grid-template-columns: 0.5fr 1fr;
        border-bottom: 1px solid rgb(74, 74, 74);
    }
    .contact-item p {
        font-size: 1rem;
        margin: 0;
    }
    .contact-item a {
        margin: 0;
        font-size: 1rem;
        text-decoration: none;
        color: black;
    }
    .contact-item a:hover {
        color: var(--linkHoverColor);
    }
    .avatar {
        width: 200px;
        height: 200px;
        border-radius: 50%;
    }
    @media (max-width: 1100px) {
        .profile {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .other {
            display: flex;
            flex-direction: column;
        }
        .avatar {
            width: 150px;
            height: 150px;
        }
        .contact-item p {
            font-size: 0.8rem;
        }
        .contact-item a {
            font-size: 0.8rem;
        }
    }
</style>
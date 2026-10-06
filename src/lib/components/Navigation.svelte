<!--
    this component provide the navigation.
    -> flex box
    -> "between space" arrangement
    -> current page detect
    -> width limit in special range(var,var)
-->

<script>
    import logo from "$lib/assets/logo.webp";
    import { resolve } from '$app/paths';

    import { page } from '$app/state';

    const navItems = [
        { name: 'PROJECTS', href: '/projects' },
    ];
</script>

<nav class="navigation">
    <a href={resolve('/')} class="logoHref">
        <img src={logo} alt="Logo">
    </a>
    <ul>
        {#each navItems as item}
            <li>
                <a href={resolve(item.href)} class:active={page.url.pathname === item.href}>
                    {item.name}
                </a>
            </li>
        {/each}
    </ul>
</nav>

<style>
    .navigation {
        padding: 0 10svw;
        box-sizing: border-box;
        border-bottom: 1px solid var(--BorderColorW);
        
        width: min(var(--initContentWidth), var(--maxContentWidth));
        height: 70px;

        display: flex;
        justify-content: space-between;
        align-items: center;

        background-color: #1e1e1e;
    }
    .logoHref{
        height: 100%;

        display: flex;
        align-items: center;
    }
    .logoHref img{
        height: 80%;
    }

    .navigation ul {
        margin: 0;
        padding: 0;
        color: white;

        display: flex;
        justify-content:flex-end;
        align-items: center;
        gap: 1.5rem;

        list-style: none;
        font-size: 1rem;
    }
    .navigation li {
        cursor: pointer;
    }
    .navigation a {
        text-decoration: none;
        color: inherit;
    }
    .navigation a:hover {
        color: var(--linkHoverColor);
    }
    .navigation a.active {
        color: var(--linkHoverColor);
    }
    .navigation a.active::after {
        content: '';
        margin-top: 2px;
        width: 100%;
        height: 2px;
        display: block;
        background-color: var(--linkHoverColor);
    }

    @media (max-width: 768px) {
        .navigation {
            height: 50px;
        }
        .navigation ul {
            gap: 1rem;
            font-size: 0.7rem;
        }
    }
</style>
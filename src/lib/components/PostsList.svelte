<script lang="ts">
    import { resolve } from '$app/paths';

    interface PostFile {
        metadata?: {
            title?: string;
            date?: string;
            tags?:string[];
        };
    }
    interface PostItem {
        slug: string;
        pathSegments: string[];
        title: string;
        date: string;
        tags: string[];
    }

    // all posts data
    const postFiles = import.meta.glob('#lib/posts/**/*.md', { eager: true }) as Record<string, PostFile>;
    const posts: PostItem[] = Object.entries(postFiles).map(([path, file]) => {
        const relativePath = path.split('posts/')[1] || '';
        const slug = relativePath.replace('.md', '');
        const pathSegments = slug.split('/'); 
        return {
            slug,
            pathSegments,
            title: file.metadata?.title || pathSegments[pathSegments.length - 1],
            date: file.metadata?.date || '',
            tags: file.metadata?.tags || [],
        };
    });
    // get all unique tags from posts and transform to a set
    const allTags = $derived(
        Array.from(new Set(posts.flatMap(post => post.tags)))
    );
    // state for selected tag and filtered posts
    let selectedTag = $state<string | null>(null);
    let filteredPosts = $derived(
        [...selectedTag ? posts.filter(post => post.tags.includes(selectedTag as string)) : posts]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    let fileTree = $derived(getFileTree(filteredPosts));
    // state for open folders in the file tree
    let openFolders = $state<Record<string, boolean>>({});

    
    // helper function to build a nested file tree structure from the flat list of posts
    function getFileTree(postList: PostItem[]) {
        const tree: Record<string, any> = {};
        postList.forEach(post => {
            let current = tree;
            post.pathSegments.forEach((part, index) => {
                const isFile = index === post.pathSegments.length - 1;
                if (isFile) {
                    current[part] = { type: 'file', post };
                } else {
                    current[part] = current[part] || { type: 'folder', children: {} };
                    current = current[part].children;
                }
            });
        });
        return tree;
    }
    // function to toggle the open/closed state of a folder in the file tree
    function toggleFolder(path: string) {
        openFolders[path] = !openFolders[path];
    }
</script>

<!-- Recursively display the contents of folders and files -->
{#snippet renderTree(subTree: Record<string, any>, currentPath = '')}
    <ul class="file-tree-list">
        {#each Object.entries(subTree) as [name, node]}
            {@const fullPath = currentPath ? `${currentPath}/${name}` : name}
            
            <li class="tree-item">
                {#if node.type === 'folder'}
                    <!-- folders -->
                    <button type="button" class="folder-header" onclick={() => toggleFolder(fullPath)}>
                        <span class="icon">{openFolders[fullPath] ? '📂' : '📁'}</span>
                        <span class="name">{name}</span>
                        <span class="arrow">{openFolders[fullPath] ? '▼' : '▶'}</span>
                    </button>
                    
                    {#if openFolders[fullPath]}
                        <div class="folder-content">
                            {@render renderTree(node.children, fullPath)}
                        </div>
                    {/if}
                {:else}
                    <!-- files -->
                    <a href={resolve('/posts/[...slug]', { slug: node.post.slug })} class="file-link">
                        <span class="icon">📄</span>
                        <span class="name">{node.post.title}</span>
                        {#if node.post.date}
                            <span class="date">{node.post.date}</span>
                        {/if}
                    </a>
                {/if}
            </li>
        {/each}
    </ul>
{/snippet}

<section class="posts-container">
    <div class="explorer-sidebar">
        {@render renderTree(fileTree)}
    </div>
    <div>
        <button 
            class="tag-btn" 
            class:active={selectedTag === null} 
            onclick={() => selectedTag = null}
        >
            ALL ({posts.length})
        </button>
        {#each allTags as tag}
            <button 
                class="tag-btn" 
                class:active={selectedTag === tag} 
                onclick={() => selectedTag = tag}
            >
                {tag}
            </button>
        {/each}
    </div>
</section>

<style>
    .posts-container {
        width: 100%;
        margin: 10px auto;
        font-family: system-ui, -apple-system, sans-serif;
        display: grid;
        grid-template-columns: 70% 30%;
        gap: 20px;
    }

    .tag-btn {
        border: none;
        background: none;
        padding: 0 5px;
        font: inherit;
        font-size: 0.9rem;
        color: var(--silver);
        cursor: pointer;
        text-decoration: none;
        display: inline;
    }
    .tag-btn:hover {
        color: black;
    }
    .tag-btn.active {
        color: black;
        background: none;
        text-decoration: underline;
    }

    .explorer-sidebar {
        height: fit-content;
        background: #f8f9fa;
        border: 1px solid #e1e4e8;
        padding: 10px;
    }
    .file-tree-list {
        list-style: none;
        padding-left: 15px;
        margin: 0.2rem 0;
    }

    /* Disable indentation for the top-level `file-tree-list` */
    .explorer-sidebar > .file-tree-list {
        padding-left: 0;
    }

    .tree-item {
        margin: 4px 0;
    }

    .folder-header {
        display: flex;
        align-items: center;
        width: 100%;
        background: none;
        border: none;
        font: inherit;
        text-align: left;
        gap: 6px;
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        user-select: none;
        font-weight: 500;
        color: #24292e;
    }

    .folder-header:hover {
        background: #e1e4e8;
    }

    .arrow {
        font-size: 0.7rem;
        margin-left: auto;
    }

    .file-link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        border-radius: 4px;
        color: #0366d6;
        text-decoration: none;
        font-size: 0.95rem;
    }

    .file-link:hover {
        background: #f1f8ff;
        text-decoration: underline;
    }

    .date {
        margin-left: auto;
        font-size: 0.8rem;
        color: #6a737d;
    }
    @media(max-width: 1100px) {
        .posts-container {
            width: 100%;
            grid-template-columns: none;
            gap: 10px;
        }
    }
</style>
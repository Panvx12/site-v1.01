<script lang="ts">
    import { resolve } from '$app/paths';

    // 定義文章資料的型別介面
    interface PostFile {
        metadata?: {
            title?: string;
            date?: string;
        };
    }
    interface PostItem {
        slug: string;
        pathSegments: string[];
        title: string;
        date: string;
    }

    // 1. 抓取 src/posts 底下的所有 .md 檔案
    const postFiles = import.meta.glob('#lib/posts/**/*.md', { eager: true }) as Record<string, PostFile>;

    // 2. 取得並解析文章資料（使用 split('posts/') 確保絕對從 posts 內部開始）
    const posts: PostItem[] = Object.entries(postFiles).map(([path, file]) => {
        // 例如 path 是 "/src/posts/tech/js.md" 或 "src/posts/tech/js.md"
        // 用 split('posts/') 抓取後面「tech/js.md」這段
        const relativePath = path.split('posts/')[1] || '';
        const slug = relativePath.replace('.md', ''); // 變成 "tech/js"
        const pathSegments = slug.split('/'); // 變成 ['tech', 'js']
        
        return {
            slug,
            pathSegments,
            title: file.metadata?.title || pathSegments[pathSegments.length - 1],
            date: file.metadata?.date || ''
        };
    });

    // 3. 建立多層資料夾樹狀結構的工具函式
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

    const fileTree = getFileTree(posts);

    // 控制資料夾開合狀態的物件（Svelte 5 狀態）
    let openFolders = $state<Record<string, boolean>>({});

    function toggleFolder(path: string) {
        openFolders[path] = !openFolders[path];
    }
</script>

<!-- 遞迴顯示資料夾與檔案的內部組件 -->
{#snippet renderTree(subTree: Record<string, any>, currentPath = '')}
    <ul class="file-tree-list">
        {#each Object.entries(subTree) as [name, node]}
            {@const fullPath = currentPath ? `${currentPath}/${name}` : name}
            
            <li class="tree-item">
                {#if node.type === 'folder'}
                    <!-- 資料夾項目 -->
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
                    <!-- 檔案（文章）項目 -->
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

<div class="posts-container">
    <div class="explorer-sidebar">
        {@render renderTree(fileTree)}
    </div>
</div>

<style>
    .posts-container {
        width: 80%;
        margin: 10px auto;
        font-family: system-ui, -apple-system, sans-serif;
    }

    .explorer-sidebar {
        background: #f8f9fa;
        border: 1px solid #e1e4e8;
        border-radius: 8px;
        padding: 10px;
    }

    .file-tree-list {
        list-style: none;
        padding-left: 15px;
        margin: 0.2rem 0;
    }

    /*針對第一層 file-tree-list 不縮排**/
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
        }
    }
</style>
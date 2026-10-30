import { error } from '@sveltejs/kit';

const posts = import.meta.glob('#lib/posts/**/*.md');

export async function entries() {
    const entriesList = Object.keys(posts).map((path) => {
        const relativePath = path.split('posts/')[1] || '';
        const slug = relativePath.replace('.md', ''); // 例如 "tech/frontend/svelte"
        
        // 這裡直接回傳字串，符合 RouteParams 的型別要求
        return { slug };
    });
    return entriesList;
}

export const prerender = true;

export async function load({ params }) {
    try {
        // params.slug 在 [...slug] 路由中會是字串（例如 "tech/frontend/svelte"）
        const slugParam = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;

        const matchedPath = Object.keys(posts).find((path) => 
            path.endsWith(`/${slugParam}.md`) || path.endsWith(`${slugParam}.md`)
        );

        if (!matchedPath) {
            throw error(404, `找不到文章：${slugParam}`);
        }

        const postLoader = posts[matchedPath];
        const post = /** @type {any} */ (await postLoader());
        
        return {
            content: post.default,
            metadata: post.metadata
        };
    } catch (e) {
        console.error('載入文章失敗，錯誤原因：', e);
        throw error(404, `找不到文章：${params.slug}`);
    }
}
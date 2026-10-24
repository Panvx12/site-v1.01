import { error } from '@sveltejs/kit';

const posts = import.meta.glob('#lib/posts/*.md');

export async function entries() {
    const slugs = Object.keys(posts).map((path) => {
        const filename = path.split('/').pop() || '';
        const slug = filename.replace('.md', '');
        return { slug };
    });
    return slugs;
}

export const prerender = true;

export async function load({ params }) {
    try {
        const matchedPath = Object.keys(posts).find((path) => 
            path.endsWith(`${params.slug}.md`)
        );

        if (!matchedPath) {
            throw error(404, `找不到文章：${params.slug}`);
        }

        const postLoader = posts[matchedPath];
        const post = /** @type {any} */ (await postLoader());
        
        return {
            content: post.default,
        };
    } catch (e) {
        console.error('載入文章失敗，錯誤原因：', e);
        throw error(404, `找不到文章：${params.slug}`);
    }
}

import { error } from '@sveltejs/kit';

/**
 * @typedef {{
 *   default: import('svelte').Component;
 *   metadata: Record<string, any>;
 * }} PostModule
 */

const posts = import.meta.glob('#lib/posts/**/*.md');

export function entries() {
    return Object.keys(posts).map((path) => {
        const relativePath = path.split('posts/')[1] || '';

        return {
            slug: relativePath.replace(/\.md$/, '')
        };
    });
}

export const prerender = true;

export async function load({ params }) {
    const slug = params.slug;

    const matchedPath = Object.keys(posts).find((path) => {
        const relativePath = path.split('posts/')[1] || '';

        return relativePath.replace(/\.md$/, '') === slug;
    });

    if (!matchedPath) {
        error(404, `找不到文章：${slug}`);
    }

    /** @type {PostModule} */
    const post = /** @type {PostModule} */ (
        await posts[matchedPath]()
    );

    return {
        content: post.default,
        metadata: post.metadata
    };
}

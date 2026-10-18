import { error } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        // 根據網址上的 slug 讀取 $lib/posts/ 底下的 .md 檔
        const post = await import(`$lib/posts/${params.slug}.md`);
        
        return {
            content: post.default,
            meta: post.metadata || {}
        };
    } catch (e) {
        console.error('載入文章失敗，錯誤原因：', e);
        throw error(404, `找不到文章：${params.slug}`);
    }
}
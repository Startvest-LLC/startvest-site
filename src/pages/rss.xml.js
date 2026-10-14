import rss from '@astrojs/rss';
import { SITE_DESCRIPTION } from '../consts';
import { getPublishedPosts } from '../lib/posts';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'StartVest blog',
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishedAt,
      link: `/blog/${p.id}`,
      categories: [p.data.category, ...p.data.tags],
    })),
  });
}

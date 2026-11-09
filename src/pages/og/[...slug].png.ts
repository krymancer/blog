import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage } from '../../lib/og';
import { humanDay } from '../../lib/date';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = (await getCollection('posts')).filter((p) => !p.data.draft);
  return [
    { params: { slug: 'site' }, props: { title: 'krymancer.dev', meta: 'Personal blog' } },
    ...posts.map((post) => ({
      params: { slug: `posts/${post.id}` },
      props: { title: post.data.title, meta: humanDay(post.data.date) },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderOgImage(props as { title: string; meta: string }), {
    headers: { 'Content-Type': 'image/png' },
  });

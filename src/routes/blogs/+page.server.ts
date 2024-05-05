import { glob } from 'glob';
import { error } from '@sveltejs/kit';

import matter from 'gray-matter';

import type { PageServerLoad } from './$types.js';
import type { Blog, BlogList } from '$lib/models/blog.js';

import { blog_folder_prefix } from '$lib/constants';

export const prerender = true;

export const load: PageServerLoad<BlogList> = async ({ params }) => {
  let blogs = await glob([blog_folder_prefix + '**/*.md']);
  const blogs_remapped = blogs.map((blog) => {
    const file_matter = matter.read(blog);

    const { 
      title, 
      description, 
      created_on, 
      tags, 
      authors, 
      posterImage 
    } = file_matter.data;
    let url_postfix = blog.replace(blog_folder_prefix, '');
    url_postfix = url_postfix.replace('.md', '');
    let blog_object: Blog = {
      front_matter: { 
        title,
        description,
        created_on,
        tags,
        posterImage,
        authors,
        file_path: blog,
        url_postfix: url_postfix
      },
      content: file_matter.content
    }

    return blog_object;
  });

  const sorted_blogs = blogs_remapped.sort((a, b) => {
    return new Date(b.front_matter.created_on).getTime() - new Date(a.front_matter.created_on).getTime();
  });

  return {
    blogs: sorted_blogs
  };
}

export const prerender = true;

import matter from 'gray-matter';
import { marked } from 'marked';
import { blog_folder_prefix } from '$lib/constants'
import type { Blog } from '$lib/models/blog';

export const load = async ({ params }) => {
  const path = params.slug;

  let blog_file_path = [blog_folder_prefix, path].join('');
  blog_file_path = blog_file_path + '.md';
  console.log('Reading blog: ', blog_file_path);

  const file_matter = matter.read(blog_file_path);

  const { title, description, created_on, tags, authors } = file_matter.data;

  const parsed_html = await marked.parse(file_matter.content);
  let blog: Blog = {
    front_matter: { 
      title, 
      description, 
      created_on,
      tags,
      authors, 
      file_path: blog_file_path,
      url_postfix: path
    },
    content: parsed_html
  }

  return blog;
}

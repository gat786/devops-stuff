export const prerender = true;

import matter from 'gray-matter';
import { marked } from 'marked';
import { blog_folder_prefix } from '$lib/constants'
import type { Blog } from '$lib/models/blog';
import { generateOgFile } from "$lib/og-generator";


export const load = async ({ params }) => {
  const path = params.slug;

  let blog_file_path = [blog_folder_prefix, path].join('');
  blog_file_path = blog_file_path + '.md';
  console.log('Reading blog: ', blog_file_path);

  const file_matter = matter.read(blog_file_path);

  const { title, description, created_on, tags, authors, posterImage } = file_matter.data;

  const parsed_html = await marked.parse(file_matter.content);

  let titleLower : string = title.toLowerCase()
  let titleLowerWithoutSpace = titleLower.replaceAll(' ', '-');
  let titleCleaned = titleLowerWithoutSpace.replaceAll(/[^0-9a-zA-Z_-]/g, '')
  let ogFileName = `${titleCleaned}`;
  let ogFilePath = `/images/ogImages/${ogFileName}`
  await generateOgFile({
    ogContent: {
      title: title
    },
    ogImageFileName: ogFileName,
    pathToStoreImage: ogFilePath
  });

  let blog: Blog = {
    front_matter: { 
      title, 
      description, 
      created_on,
      posterImage,
      ogFilePath: ogFilePath + '.jpg',
      tags,
      authors, 
      file_path: blog_file_path,
      url_postfix: path
    },
    content: parsed_html
  }
  return blog;
}

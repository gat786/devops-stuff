export const prerender = true;

import matter from "gray-matter";
import { marked } from "marked";
import { blog_folder_prefix } from "$lib/constants";
import type { Blog } from "$lib/models/blog";
import { generateOgFile } from "$lib/og-generator";
import { setupPageViews } from "$lib/server/create-page-for-views";

export const load = async ({ params }) => {
  const path = params.slug;

  let blog_file_path = [blog_folder_prefix, path].join("");
  blog_file_path = blog_file_path + ".md";
  console.log("Reading blog: ", blog_file_path);

  const file_matter = matter.read(blog_file_path);

  const { title, description, created_on, tags, authors, posterImage } =
    file_matter.data;

  const parsed_html = await marked.parse(file_matter.content);

  const titleLower: string = title.toLowerCase();
  const titleLowerWithoutSpace = titleLower.replaceAll(" ", "-");
  const titleCleaned = titleLowerWithoutSpace.replaceAll(/[^0-9a-zA-Z_-]/g, "");
  const ogFileName = `${titleCleaned}`;
  const ogFilePath = `/images/ogImages/${ogFileName}`;
  await generateOgFile({
    ogContent: {
      title: title,
      publishedDate: (created_on as Date).toDateString(),
      path: "Home > Blogs >",
    },
    ogImageFileName: ogFileName,
    pathToStoreImage: ogFilePath,
  });

  let page_id = `devops-stuff.dev/blogs/${path}`;
  page_id = page_id.replaceAll("/", "");
  console.log("Setting up page views for: ", page_id);

  await setupPageViews(page_id);

  const blog: Blog = {
    front_matter: {
      title,
      description,
      created_on,
      posterImage,
      ogFilePath: ogFilePath + ".jpg",
      tags,
      authors,
      file_path: blog_file_path,
      url_postfix: path,
    },
    content: parsed_html,
  };
  return blog;
};

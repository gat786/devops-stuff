import { glob } from 'glob';
import { error } from '@sveltejs/kit';

import matter from 'gray-matter';
import { marked } from 'marked';

import type { PageServerLoad } from './$types.js';

import { others_static_folder } from '$lib/constants';
import type { LicenseContent } from '$lib/models/blog.js';

export const prerender = true;

export const load: PageServerLoad<LicenseContent> = async ({ params }) => {

  let license_file_path = others_static_folder + '/LICENSE.md'  
  const file_matter = matter.read(license_file_path);
  const parsed_html = await marked.parse(file_matter.content);
  return {
    license: parsed_html
  };
}

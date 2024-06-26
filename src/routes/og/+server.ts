// src/routes/og/+server.ts
import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';
import type { SatoriOptions } from 'satori/wasm';
import fs from "node:fs";
import Handlebars from 'handlebars';

const template = `
<div tw="bg-gray-50 flex flex-col w-full h-full items-center justify-center">
  <div tw="font-light text-sm mb-6">{{ pageType }}</div>
  <div tw="mb-6 text-lg font-medium">{{ pageTitle }}</div>
  <div tw="text-2xl font-black text-orange-700">The Devops Stuff</div>
</div>
  `;

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = {
  name: string,
  weight: Weight
}
let fontName = "Roboto"
let fontStyles: FontStyle[] = [
  { 'name': "Thin", 'weight': 100 },
  { 'name': "Light", 'weight': 300 },
  { 'name': "Regular", 'weight': 400 },
  { 'name': "Medium", 'weight': 500 },
  { 'name': "Bold", 'weight': 700 },
  { 'name': "Black", 'weight': 900 },
]

const fontDataList: SatoriOptions["fonts"] = [];
const rootDir = process.cwd();

fontStyles.forEach(element => {
  let fontFileLocation = `${rootDir}/static/fonts/${fontName}-${element.name}.ttf`
  let fontData = fs.readFileSync(fontFileLocation);
  fontDataList.push({
    name: 'Roboto',
    data: fontData,
    weight: element.weight
  })
});

export const GET: RequestHandler = async ({ params, url }) => {
  let pageType  = url.searchParams.get('pageType') ?? "Default";
  let pageTitle = url.searchParams.get('pageTitle') ?? "Some common Title";

  const handlebarsTemplate = Handlebars.compile(template);
  const contentResult = handlebarsTemplate({
    pageType,
    pageTitle
  })
  return await new ImageResponse(contentResult, {
    height: 630,
    width: 1200,
    fonts: fontDataList
  });
};

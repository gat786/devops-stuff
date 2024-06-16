import puppeteer from 'puppeteer';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import Handlebars from 'handlebars';

let rootDir = process.cwd();
let globSearchPattern = `${rootDir}/build/**/*.html`;
let staticContentFolder = `${rootDir}/og-image-static-content`;
let ogImageFolder = `static/images/ogImages/`;
if ( !fs.existsSync(ogImageFolder)){
  console.log('screenshots directory does not exist creating one');
  fs.mkdirSync(ogImageFolder);
}

type takeScreenshotArgs = {
  webpagePath: string | null,
  screenshotStoragePath: string | null
}

type generateOgFileArgs = {
  ogContent: {
    title: string
  },
  ogImageFileName: string,
  pathToStoreImage: string,
}

const takeScreenshot = async ( options: takeScreenshotArgs ) => {
  const browser = await puppeteer.launch({
    product: 'firefox'
  });
  const page = await browser.newPage();
  
  let route = options.webpagePath != null ? options.webpagePath : '';
  await page.goto(`http://127.0.0.1:8080/${route}`);
  await page.setViewport({ width: 1200, height: 628 });
  
  let ogImagePath = options.screenshotStoragePath != null ? options.screenshotStoragePath : 'screenshot.jpg'
  await page.screenshot({ path: ogImagePath });
  await browser.close();
};

const findHTMLFiles = async () => {
  console.log(`current working directory: ${rootDir}`);
  
  const htmlFiles = await glob( 
    globSearchPattern, 
    { ignore: 'node_modules/**' }
  )
  
  htmlFiles.forEach(async (file) => {
    console.log(`processing ${file}`)
    await fs.readFile(file, 'utf-8',async (err, data) => {
      if(err){
        console.error(err);
        return;
      }
      const dom = new JSDOM(data);
      const htmlDoc = dom?.window?.document;
      let headElement = htmlDoc?.head;

      const metaElements = headElement?.getElementsByTagName("meta");
      const metaElementsArray = Array.from(metaElements)
      console.log(`found meta elements`);
      metaElementsArray.forEach(async (metaElement) => {
        let metaProperty = metaElement.getAttribute("property");
        if (metaProperty == "og:title") {
          console.log('found title file, creating og image');
          let metaTitle = metaElement.getAttribute("content");

          const template_index = fs.readFileSync(
            `${staticContentFolder}/template_index.html`,
            { encoding: 'utf-8' }
          );
          const template  = Handlebars.compile(template_index);
          const indexHtml = template({ title: metaTitle });
          
          let fileName = metaTitle?.split(' ').join('-') ?? "";
          let generatedFilePath = `generated/${fileName}.html`
          
          fs.writeFileSync(
            `${staticContentFolder}/${generatedFilePath}`,
            indexHtml
          )

          // startExpress();
          let pathToJpg = `${ogImageFolder}/${fileName}.jpg`
          console.log(`taking screenshot`);
          await takeScreenshot({
            webpagePath: fileName,
            screenshotStoragePath: pathToJpg
          });
        }
      })
    })
  })
}

export const generateOgFile = async (args: generateOgFileArgs) => {
  console.log(`processing ${args.ogImageFileName}`);
  
  const template_index = fs.readFileSync(
    `${staticContentFolder}/template_index.html`,
    { encoding: 'utf-8' }
  );
  const template  = Handlebars.compile(template_index);
  const indexHtml = template({ title: args.ogContent.title });
  
  let generatedFilePath = `generated/${args.ogImageFileName}.html`;
  let completeFilePath = `${staticContentFolder}/${generatedFilePath}`; 
  let generatedFileParentDir = path.dirname(completeFilePath);
  if (!fs.existsSync(generatedFileParentDir)){
    fs.mkdirSync(generatedFileParentDir)
  }
  fs.writeFileSync(
    `${staticContentFolder}/${generatedFilePath}`,
    indexHtml
  )

  // startExpress();
  let pathToStoreImage = `${ogImageFolder}/${args.ogImageFileName}.jpg`
  console.log(`taking screenshot and storing it in `);
  await takeScreenshot({
    screenshotStoragePath: pathToStoreImage,
    webpagePath: `${generatedFilePath}`
  });
}

// await findHTMLFiles()

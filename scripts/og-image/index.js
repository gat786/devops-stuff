import puppeteer from 'puppeteer';
import express from 'express';
import { glob } from 'glob';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import Handlebars from 'handlebars';
import { options } from 'marked';
import { title } from 'node:process';

const takeScreenshot = async ( path = null ) => {
  const browser = await puppeteer.launch({
    product: 'firefox'
  });
  const page = await browser.newPage();
  const current_dir = process.cwd();

  const og_image_file = `${current_dir}/content/index.html`;

  console.log(`url ${og_image_file}`)
  await page.goto("http://127.0.0.1:3000/");
  await page.setViewport({ width: 1200, height: 628 });
  
  let ogImagePath = path != null ? path : 'screenshot.jpg'
  await page.screenshot({ path: ogImagePath });
  

  await browser.close();
};

const startExpress = async () => {
  const app = express()
  const port = 3000

  app.use('/',express.static(process.cwd() + '/content/'))

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
};

const findHTMLFiles = async () => {

  console.log(`current working directory: ${process.cwd()}`);
  const htmlFiles = await glob(`${process.cwd()}/build/**/*.html`, { ignore: 'node_modules/**' })
  
  htmlFiles.forEach((file) => {
    fs.readFile(file, 'utf-8',(err, data) => {
      if(err){
        console.error(err);
        return;
      }
      const dom = new JSDOM(data);
      const htmlDoc = dom?.window?.document;
      let headElement = htmlDoc?.head;

      const metaElements = headElement?.getElementsByTagName("meta");
      for (let metaElementIndex = 0; metaElementIndex < metaElements.length; metaElementIndex++) {
        const metaElement = metaElements.item(metaElementIndex);
        let metaProperty = metaElement.getAttribute("property");
        if (metaProperty == "og:title") {
          let metaTitle = metaElement.getAttribute("content");
          let contentFolder = `${process.cwd()}/content`;
          const template_index = fs.readFileSync(
            `${contentFolder}/template_index.html`,
            { encoding: 'utf-8' }
          );
          const template  = Handlebars.compile(template_index);
          const indexHtml = template({ title: metaTitle });

          fs.writeFileSync(
            `${contentFolder}/index.html`,
            indexHtml
          )

          startExpress();
          let path = `screenshot/${file}.jpg`
          takeScreenshot(path);
        }
      }
    })
  })
}

findHTMLFiles()

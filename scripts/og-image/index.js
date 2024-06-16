import puppeteer from 'puppeteer';
import express from 'express';

const takeScreenshot = async () => {
  const browser = await puppeteer.launch({
    product: 'firefox'
  });
  const page = await browser.newPage();
  const current_dir = process.cwd();

  const og_image_file = `${current_dir}/content/index.html`;

  console.log(`url ${og_image_file}`)
  await page.goto("http://127.0.0.1:3000/");
  await page.setViewport({ width: 1200, height: 628 });
  await page.screenshot({ path: 'screenshot.jpg' });

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

startExpress();
takeScreenshot();

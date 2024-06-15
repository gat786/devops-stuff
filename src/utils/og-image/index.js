import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  product: 'firefox'
});
const page = await browser.newPage();
const current_dir = process.cwd();

const og_image_file = `${current_dir}/content/index.html`;

console.log(`url ${og_image_file}`)
await page.goto("http://127.0.0.1:5500/content/");
await page.setViewport({width: 1200, height: 628});
await page.screenshot({ path: 'screenshot.jpg' });

await browser.close();

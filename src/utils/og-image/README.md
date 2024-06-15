# Necessary instructions to get og-image working.

1. Need to template the index.html inside content folder.
2. Rendering via firefox requires installation of firefox driver using
   ```
   npx puppeteer browsers install firefox
   ```
3. Run the script using `npm run generate` and it will generate a screenshot file
   called screenshot.png in this directory itself.

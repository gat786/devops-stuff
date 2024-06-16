
npx http-server ./og-image-static-content &
npx puppeteer browsers install chrome
vite build
killall http-server

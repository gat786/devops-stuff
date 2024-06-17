
# npx http-server ./og-image-static-content & && \
npx puppeteer browsers install chrome && \
vite build 2> /dev/null || \
vite build && \
killall http-server

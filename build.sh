#!/bin/bash

# Start http-server in the background
npx http-server ./og-image-static-content &
HTTP_SERVER_PID=$!

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome
INSTALL_STATUS=$?
if [ $INSTALL_STATUS -ne 0 ]; then
  kill $HTTP_SERVER_PID
  exit $INSTALL_STATUS
fi

# Build with Vite
vite build
BUILD_STATUS=$?
if [ $BUILD_STATUS -ne 0 ]; then
  vite build
  BUILD_STATUS=$?
  if [ $BUILD_STATUS -ne 0 ]; then
      kill $HTTP_SERVER_PID
      exit $BUILD_STATUS
  fi
fi

# Kill the http-server
kill $HTTP_SERVER_PID
KILL_STATUS=$?
if [ $KILL_STATUS -ne 0 ]; then
  exit $KILL_STATUS
fi

exit 0

WORKDIR="$(pwd)"
OG_IMAGE_DIR="$(pwd)/scripts/og-image"

# npm run build # this causes a loop 

vite build

echo workdir $WORKDIR
echo og-image-dir $OG_IMAGE_DIR

mkdir $OG_IMAGE_DIR/build/
cp -r build/ $OG_IMAGE_DIR/build/

cd $OG_IMAGE_DIR

npx http-server content &

npm install
npm run generate

killall http-server

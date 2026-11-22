#!/bin/zsh
# Renders the 4 guide images (player/admin x ar/en) with headless Chrome: ./build.sh
cd "$(dirname "$0")"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for doc in player admin; do for lang in ar en; do
  url="file://$PWD/guide.html?doc=$doc&lang=$lang"
  h=$("$C" --headless --disable-gpu --window-size=2000,4000 --virtual-time-budget=4000 --dump-dom "$url" 2>/dev/null | grep -o 'data-h="[0-9]*"' | grep -o '[0-9]*')
  echo "$doc-$lang height=$h"
  "$C" --headless --disable-gpu --hide-scrollbars --window-size=2000,${h:-2400} --virtual-time-budget=4000 --screenshot="armor-of-god-$doc-$lang.png" "$url" >/dev/null 2>&1
done; done
ls -la *.png

#!/bin/zsh
# Builds the poster PNGs with the game's join QR:  ./build.sh [join-url] ["place"] ["date / time"]
#   no url -> https://<this laptop's LAN IP>:4000/   (rebuild at the venue so the QR matches the real address)
cd "$(dirname "$0")"
URL="${1:-$(node -e "const {lanAddresses}=require('../../share');console.log('https://'+(lanAddresses()[0]||'localhost')+':4000/')")}"
node -e "require('../../node_modules/qrcode').toString(process.argv[1],{type:'svg',margin:0,width:400}).then(s=>require('fs').writeFileSync('qr.js','window.QR_SVG='+JSON.stringify(s)+';'))" "$URL"
echo "QR -> $URL"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
enc() { python3 -c "import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))" "$1"; }
for f in tall square; do for lang in ar en; do
  q="f=$f&lang=$lang&place=$(enc "$2")&time=$(enc "$3")"
  w=1536; [ "$f" = square ] && w=1080
  h=$("$C" --headless --disable-gpu --window-size=$w,4000 --virtual-time-budget=4000 --dump-dom "file://$PWD/poster.html?$q" 2>/dev/null | grep -o 'data-h="[0-9]*"' | grep -o '[0-9]*')
  "$C" --headless --disable-gpu --hide-scrollbars --window-size=$w,${h:-2800} --virtual-time-budget=4000 --screenshot="poster-$f-$lang.png" "file://$PWD/poster.html?$q" >/dev/null 2>&1
  echo "poster-$f-$lang.png ${w}x${h}"
done; done

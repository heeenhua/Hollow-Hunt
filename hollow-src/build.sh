#!/bin/bash
cd "$(dirname "$0")"
OUT="../hollow-hunt.html"
{
cat <<'HEAD'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>HOLLOW HUNT</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}body{display:flex;align-items:center;justify-content:center}
canvas{image-rendering:pixelated;width:min(100vw,calc(100vh*800/576));aspect-ratio:800/576;background:#000}</style></head>
<body><canvas id="c" width="800" height="576"></canvas>
<script>
(()=>{'use strict';
HEAD
cat 1-core.js 2-data.js 3-render.js 4-engine.js 5-battle.js 6-menu.js 7-maps.js 8-story.js 9-main.js
echo "})();</script></body></html>"
} > "$OUT"

set -e
C="crop=1920:800:0:140"
ffmpeg -y -v error -ss 84 -t 32 -i reel-cinemacon.mov -an -vf "$C,scale=1800:-2" -c:v libx264 -crf 24 -preset slow -movflags +faststart hero-reel.mp4
ffmpeg -y -v error -ss 86 -i reel-cinemacon.mov -vf "$C,scale=1800:-2" -frames:v 1 -q:v 2 hero-poster.jpg
ffmpeg -y -v error -ss 100 -t 14 -i reel-cinemacon.mov -an -vf "$C,scale=1200:-2" -c:v libx264 -crf 25 -preset slow -movflags +faststart case-everest.mp4
ffmpeg -y -v error -ss 15 -t 12 -i tease-trapped.mp4 -an -vf "crop=1920:800:0:140,scale=1200:-2" -c:v libx264 -crf 25 -preset slow -movflags +faststart case-trapped.mp4
ffmpeg -y -v error -ss 2 -i case-trapped.mp4 -frames:v 1 -q:v 2 case-trapped-poster.jpg
ffmpeg -y -v error -ss 3 -i case-everest.mp4 -frames:v 1 -q:v 2 case-everest-poster.jpg
mkdir -p seq2 seq2-m
ffmpeg -y -v error -i brandfilm-scope.mp4 -vf "fps=7,scale=2048:-2" -q:v 2 seq2/f-%03d.jpg
ffmpeg -y -v error -i brandfilm-scope.mp4 -vf "fps=6,scale=1000:-2" -q:v 3 seq2-m/f-%03d.jpg
for f in seq2/*.jpg; do cwebp -quiet -q 80 "$f" -o "${f%.jpg}.webp"; done
for f in seq2-m/*.jpg; do cwebp -quiet -q 72 "$f" -o "${f%.jpg}.webp"; done
echo "DESKTOP $(ls seq2/*.webp | wc -l) frames $(du -sh seq2 | cut -f1)"
echo "MOBILE $(ls seq2-m/*.webp | wc -l) frames $(du -sh seq2-m | cut -f1)"
ls -la hero-reel.mp4 case-trapped.mp4 case-everest.mp4 | awk '{print $5, $9}'

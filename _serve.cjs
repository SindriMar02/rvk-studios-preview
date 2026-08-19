const http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/Users/sindri/Documents/Website redesign mockups/rvk-studios';
const M={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);
if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}
const st=fs.statSync(f),ext=path.extname(f),range=q.headers.range;
if(range){const[s,e]=range.replace('bytes=','').split('-');const a=+s,b=e?+e:st.size-1;
r.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':b-a+1,'Content-Type':M[ext]||'application/octet-stream'});fs.createReadStream(f,{start:a,end:b}).pipe(r);}
else{r.writeHead(200,{'Content-Type':M[ext]||'application/octet-stream','Content-Length':st.size});fs.createReadStream(f).pipe(r);}
}).listen(8406,'127.0.0.1',()=>console.log('serving 8406'));

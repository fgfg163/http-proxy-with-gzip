const http = require('http');
const parseurl = require('url').parse;
const zlib = require('zlib');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({ ws: true, target: { host: '127.0.0.1', port: 8888 }});

const s = http.createServer((req, res) => {
  if (true || req.headers['HOST'] === 'ml.niven.cn') {
  const opt = parseurl('http://127.0.0.1:8888' + req.url);
  opt.headers = req.headers;
  opt.method = req.method;
  const pReq = http.request(opt, pRes => {
    delete pRes.headers['content-length'];
  pRes.headers['content-encoding'] = 'gzip';
  res.writeHead(pRes.statusCode, pRes.headers);
  pRes.pipe(zlib.createGzip()).pipe(res);
});
  req.pipe(pReq);
} else {
  res.writeHead(401);
  res.end('');
}
});
s.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});
s.listen(80);

const http = require('http');
const parseurl = require('url').parse;
const zlib = require('zlib');
const httpProxy = require('http-proxy');
const program = require('commander')

program
  .version('0.0.1')
  .option('-p, --port [number]', 'Server listen port, default 80', '80')
  .option('-t, --target [host:port]', 'target, default 127.0.0.1:8888', '127.0.0.1:8888')
  .parse(process.argv)

const target = program.target;
const tHost = target.replace(/^.*:\/\//, '').replace(/\/.*/, '').replace(/:.*/, '') || '127.0.0.1';
const tPort = (target.match(/:(\d{1,5})/) || [])[1] || '8888';

const proxy = httpProxy.createProxyServer({ ws: true, target: { host: tHost, port: tPort } });

const s = http.createServer((req, res) => {
  const opt = parseurl(`http://${tHost}:${tPort}` + req.url);
  opt.headers = req.headers;
  opt.method = req.method;
  const pReq = http.request(opt, pRes => {
    delete pRes.headers['content-length'];
    pRes.headers['content-encoding'] = 'gzip';
    res.writeHead(pRes.statusCode, pRes.headers);
    pRes.pipe(zlib.createGzip()).pipe(res);
  });
  req.pipe(pReq);
});
s.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});
s.listen(program.port);

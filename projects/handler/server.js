const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

server.listen(process.env.PORT, '0.0.0.0');

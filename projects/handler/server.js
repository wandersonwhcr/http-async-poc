const http = require("http");
const uuid = require("uuid");

const server = http.createServer((req, res) => {
  const requestId = uuid.v4();

  res.writeHead(200, {
    'X-Request-Id': requestId,
  });

  res.end();
});

server.listen(process.env.PORT, '0.0.0.0');

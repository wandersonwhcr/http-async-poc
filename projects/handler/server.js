const amqp = require("amqplib");
const bson = require("bson");
const http = require("http");
const uuid = require("uuid");

const handler = async () => {
  // AMQP Connection
  const connection = await amqp.connect(process.env.AMQP_URL);
  // AMQP Channel
  const channel = await connection.createChannel();
  // Assert Request and Response Queue
  channel.assertQueue("request");
  channel.assertQueue("response");

  // HTTP Server
  const server = http.createServer((req, res) => {
    // X-Request-Id
    const requestId = uuid.v4();
    // Queue
    channel.sendToQueue("request", bson.serialize({ requestId }));
    // Headers
    res.writeHead(200, {
      "X-Request-Id": requestId,
    });
    // Done!
    res.end();
  });

  // Server Listen
  server.listen(process.env.PORT, '0.0.0.0');
};

handler()
  .catch(console.warn);

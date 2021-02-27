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

  // Mapper
  const responses = {};

  // HTTP Server
  const server = http.createServer((req, res) => {
    // Identifier
    const id = uuid.v4();
    // Mapping
    responses[id] = res;
    // Queue
    channel.sendToQueue("request", bson.serialize({ id }));
  });

  // HTTP Worker
  channel.consume("response", (message) => {
    // Response
    const response = bson.deserialize(message.content);
    // Identifier
    const id = response.id;
    // Found?
    if (responses[id]) {
      // Initialize
      const res = responses[id];
      // Headers
      res.writeHead(200, {
        "X-Request-Id": id,
      });
      // Done!
      res.end();
    }
    // Done!
    channel.ack(message);
  });

  // Server Listen
  server.listen(process.env.PORT, '0.0.0.0');
};

handler()
  .catch(console.warn);

const amqp = require("amqplib");
const bson = require("bson");
const http = require("http");
const pino = require("pino");
const uuid = require("uuid");

const handler = async () => {
  // Server
  const serverId = uuid.v4();

  // AMQP Connection
  const connection = await amqp.connect(process.env.AMQP_URL);
  // AMQP Channel
  const channel = await connection.createChannel();
  // Assert Request and Response Exchange
  channel.assertExchange("request", "direct");
  channel.assertExchange("response", "direct");

  // Create a Handler Response Queue
  const q = await channel.assertQueue("", { exclusive: true });
  // Bind Server Response Queue to Response Exchange
  channel.bindQueue(q.queue, "response", serverId);

  // Logger
  const logger = pino();
  // Mapper
  const responses = {};

  // HTTP Server
  const server = http.createServer((req, res) => {
    // Identifier
    const id = uuid.v4();
    // Mapping
    responses[id] = res;
    // Queue
    channel.publish("request", "", bson.serialize({ id, serverId }));
    // Logging
    logger.info({ method: "publish", exchange: "request", id });
  });

  // HTTP Worker
  channel.consume(q.queue, (message) => {
    // Response
    const response = bson.deserialize(message.content);
    // Logging
    logger.info({ method: "consume", queue: q.queue, ...response });
    // Identifier
    const id = response.id;
    // Found?
    if (responses[id]) {
      // Initialize
      const res = responses[id];
      // Headers
      res.writeHead(200, {
        "X-Server-Id": serverId,
        "X-Request-Id": id,
      });
      // Done!
      res.end();
      // Clean
      delete responses[id];
    }
    // Done!
    channel.ack(message);
  });

  // Server Listen
  server.listen(process.env.PORT, '0.0.0.0');
};

handler()
  .catch(console.warn);

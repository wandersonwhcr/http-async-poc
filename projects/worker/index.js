const amqp = require("amqplib");
const bson = require("bson");
const pino = require("pino");

const worker = async () => {
  // AMQP Connection
  const connection = await amqp.connect(process.env.AMQP_URL);
  // AMQP Channel
  const channel = await connection.createChannel();

  // Assert Request and Response Queue
  channel.assertExchange("request", "direct");
  channel.assertExchange("response", "direct");

  // Assert Request Queue
  await channel.assertQueue("request");
  // Bind Worker Request Queue to Request Exchange
  channel.bindQueue("request", "request");

  // Logging
  const logger = pino();

  // Single Jobs
  channel.prefetch(1);

  // Consume
  channel.consume("request", (message) => {
    // Request
    const request = bson.deserialize(message.content)
    // Logging
    logger.info({ method: "consume", queue: "request", ...request });
    // Response
    const response = request;
    // Queue
    channel.publish("response", request.serverId, bson.serialize(response));
    // Logging
    logger.info({ method: "publish", exchange: "response", ...request });
    // Done!
    channel.ack(message);
  });
};

worker()
  .catch(console.warn);

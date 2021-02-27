const amqp = require("amqplib");
const bson = require("bson");

const worker = async () => {
  // AMQP Connection
  const connection = await amqp.connect(process.env.AMQP_URL);
  // AMQP Channel
  const channel = await connection.createChannel();

  // Assert Request and Response Queue
  channel.assertExchange("request", "fanout");
  channel.assertExchange("response", "direct");

  // Create a Worker Request Queue
  const q = await channel.assertQueue("", { exclusive: true });
  // Bind Worker Request Queue to Request Exchange
  channel.bindQueue(q.queue, "request");

  // Single Jobs
  channel.prefetch(1);

  // Consume
  channel.consume(q.queue, (message) => {
    // Request
    const request = bson.deserialize(message.content)
    // Response
    const response = request;
    // Queue
    channel.publish("response", "", bson.serialize(response));
    // Done!
    channel.ack(message);
  });
};

worker()
  .catch(console.warn);

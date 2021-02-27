const amqp = require("amqplib");
const bson = require("bson");

const worker = async () => {
  // AMQP Connection
  const connection = await amqp.connect(process.env.AMQP_URL);
  // AMQP Channel
  const channel = await connection.createChannel();
  // Assert Request and Response Queue
  channel.assertQueue("request");
  channel.assertQueue("response");

  // Consume
  channel.consume("request", (message) => {
    // Request
    const request = bson.deserialize(message.content)
    // Response
    const response = request;
    // Queue
    channel.sendToQueue("response", bson.serialize(response));
    // Done!
    channel.ack(message);
  });
};

worker()
  .catch(console.warn);

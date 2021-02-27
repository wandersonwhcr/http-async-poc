const amqp = require("amqplib");

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
    // Done!
    channel.ack(message);
  });
};

worker()
  .catch(console.warn);

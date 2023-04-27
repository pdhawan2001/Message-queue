const amqp = require('amqplib');
const path = require('path');

async function connect() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queueName = 'image-scaling-requests';
    const queueOptions = {
      durable: true,
    };
    await channel.assertQueue(queueName, queueOptions);

    const imagePath = path.join(__dirname, 'img', 'DSC_0502.jpg');

    // Example image scaling request
    const imageToScale = {
      imagePath: imagePath,
      scaleRatio: 0.5,
    };

    const messageOptions = { persistent: true };
    const messageBuffer = Buffer.from(JSON.stringify(imageToScale));
    channel.sendToQueue(queueName, messageBuffer, messageOptions);

    console.log('Image scaling request sent:', imageToScale);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

connect();

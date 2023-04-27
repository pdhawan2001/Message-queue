const amqp = require('amqplib');
const sharp = require('sharp');
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

    channel.consume(queueName, async (message) => {
      const imageToScale = JSON.parse(message.content.toString());

      console.log('Received image scaling request:', imageToScale);
      
      const imagePath = path.join(__dirname, 'img', 'DSC_0502.jpg');

      const scaledImagePath = path.join(__dirname, 'img/scaled', 'scaled-image.jpg');

      // Perform the image scaling operation
      const scaledImage = await sharp(imagePath)
        .resize({ width: imageToScale.scaleRatio * 100 })
        .toFile(scaledImagePath);

      console.log('Scaled image saved:', scaledImage);

      channel.ack(message);

      // Publish the scaled image to another queue or save it to a file

      // channel.ack(message);
    });

    console.log('Consumer started');
  } catch (error) {
    console.error('Error:', error);
  }
}

connect();

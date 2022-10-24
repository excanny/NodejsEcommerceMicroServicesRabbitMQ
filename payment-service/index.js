const express = require("express");
const app = express();
const PORT = process.env.PORT_PAYMENT || 8003;
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Payment = require("./models/Payment");
const { MONGO_URI } = process.env;

var channel, connection;

mongoose.connect(
    MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Payment service DB connected to mongoDB`);
    }
);

app.use(express.json());

function payNow(product, order, customerId) {
   
    const payment = new Payment({
        productId: product._id,
        customerId: customerId,
        orderId: order._id,
        orderStatus: order.status,
        amount: product.amount,
    });
    payment.save();
    return payment;
}

async function connectToRabbitMQ() {
    //const amqpServer = "amqps://ellhousx:IWYbg0ev1lQwcgpRofCMyoRlNFjo2j-_@moose.rmq.cloudamqp.com/ellhousx?connection_timeout=30";
    const amqpServer = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PAYMENT");
    console.log("connected to RabbitMQ");
}
connectToRabbitMQ().then(() => {
    channel.consume("PAYMENT-QUEUE", (data) => {
    
        const { product, order, customerId } = JSON.parse(data.content);
        payNow(product, order, customerId);
        channel.ack(data);

        console.log("payment received");
    });
});

app.listen(PORT, () => {
    console.log(`Payment service started at ${PORT}`);
});
const express = require("express");
const app = express();
const PORT = process.env.PORT_ORDER || 8003;
const mongoose = require("mongoose");
const Order = require("./models/Order");
const amqp = require("amqplib");

var channel, connection;

mongoose.connect(
    "mongodb+srv://excanny:Excannyg*1914@cluster0.rhoaa.mongodb.net/order-serviceDB?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)
.then(()=>console.log(`Order service DB connected to mongoDB`))
.catch(e=>console.log(e));

app.use(express.json());

function createOrder(product, customerId) {
   
    const newOrder = new Order({
        productId: product._id,
        customerId: customerId,
        amount: product.amount,
    });
    newOrder.save();
    return newOrder;
}

async function connectToRabbitMQ() {
    //const amqpServer = "amqps://ellhousx:IWYbg0ev1lQwcgpRofCMyoRlNFjo2j-_@moose.rmq.cloudamqp.com/ellhousx?connection_timeout=30";
    const amqpServer = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER-QUEUE");
    console.log("connected to RabbitMQ");
}
connectToRabbitMQ().then(() => {
    channel.consume("ORDER-QUEUE", (data) => {
        
        const { product, customerId } = JSON.parse(data.content);
        const order = createOrder(product, customerId);
        channel.ack(data);

        // Send the order back to the product-queue
        channel.sendToQueue(
            "PRODUCT-QUEUE",
            Buffer.from(JSON.stringify({ order }))
        );

        // Send the order details to the payment-queue
        channel.sendToQueue(
            "PAYMENT-QUEUE",
            Buffer.from(JSON.stringify({ product, order, customerId }))
        );
        
    });
});

app.listen(PORT, () => {
    console.log(`Order service started at ${PORT}`);
});
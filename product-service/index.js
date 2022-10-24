const express = require("express");
const app = express();
const PORT = process.env.PORT_PRODUCT || 8002;
const mongoose = require("mongoose");
const Product = require("./models/Product");
const amqp = require("amqplib");
const auth = require("../auth");
const { MONGO_URI } = process.env;
var order, channel, connection;

app.use(express.json());
mongoose.connect(
    MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Product service DB connected to MongoDB`);
    }
);

async function connectToRabbitMQ() {
    const amqpServer = "amqp://guest:guest@localhost:5672";
    //const amqpServer = "amqps://ellhousx:IWYbg0ev1lQwcgpRofCMyoRlNFjo2j-_@moose.rmq.cloudamqp.com/ellhousx?connection_timeout=30";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
    console.log("connected to RabbitMQ");
}
connectToRabbitMQ();

const seedProductData = async () => {
    const newProduct = new Product({
        name: 'Iphone14',
        description: 'New Iphone from Apple',
        amount: 2000,
    });
    newProduct.save();
    console.log("product seeded succesfully");
}

seedProductData();

app.post("/products/buy", auth, async (req, res) => {
    const { id } = req.body;
    const product = await Product.find({ _id: id });
    channel.sendToQueue(
        "ORDER-QUEUE",
        Buffer.from(
            JSON.stringify({
                product: product,
                customerId: req.user.email,
            })
        )
    );

    channel.consume("PRODUCT-QUEUE", (data) => {
        console.log("Consumed from product-queue");
        order = JSON.parse(data.content);
        channel.ack(data);
    });

    return res.status(201).json({
        message: "Order placed successfully",
        order,
      });
});

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});
const express = require("express");
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT_AUTH || 8001;
const Customer = require("./models/Customer");
const { MONGO_URI } = process.env;
const app = express();

mongoose.connect(
    MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)
.then(()=>console.log(`Customer service DB connected to mongoDB`))
.catch(e=>console.log(e));

app.use(express.json());

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Customer.findOne({ email });
    if (!user) return res.json({ message: "Customer doesn't exist" });
    if (!bcrypt.compare(password, user.password)) return res.json({ message: "Login incorrect" });

    const payload = { email, name: user.name };

    jwt.sign(payload, "secret", (err, token) => {
        if (err) console.log(err);
        else return res.json({ token: token });
    });

});

const seedCustomerData = async () => {
    const salt = await bcrypt.genSalt(10);
        
    encryptedPassword = await bcrypt.hash('test@yahoo.com', salt);
    const newCustomer = new Customer({
        email: 'test@yahoo.com',
        name: 'Test',
        password: encryptedPassword,
    });
    newCustomer.save();
    console.log("customer added succesfully");
}

seedCustomerData();

app.listen(PORT, () => {
    console.log(`Customer service started at ${PORT}`);
});
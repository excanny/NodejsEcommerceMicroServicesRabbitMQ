const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
   
    productId: String,
    customerId: String,
    amount: Number,
    status: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = Order = mongoose.model("order", OrderSchema);
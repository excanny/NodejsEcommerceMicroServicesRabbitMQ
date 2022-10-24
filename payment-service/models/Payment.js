const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    
    productId: String,
    customerId: String,
    orderId: String,
    amount: Number,
    orderStatus: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = Payment = mongoose.model("payment", PaymentSchema);
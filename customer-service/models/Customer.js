const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
      },
    password: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = User = mongoose.model("customer", CustomerSchema);
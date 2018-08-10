const mongoose = require('mongoose');

const loyaltySchema = mongoose.Schema({
    channelId: String,
    userId: String
});

const Loyalty = mongoose.model("Loyalties", loyaltySchema);

module.exports = {
    Loyalty: Loyalty
};
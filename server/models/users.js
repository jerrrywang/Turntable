const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    twitchId: String,
    token: {
      type: Object,
      required: true
    },
    isSubbed: {
        type: Boolean,
        default: false
    },
    streak: {
      type: Number,
        default: 0
    },
    loyaltyRate: {
      type: Number,
        default: 0
    },
    currentLoyalty: {
      type: Number,
        default: 0
    },
    totalLoyalty: {
      type: Number,
        default: 0
    },
    djElo: {
      type: Number,
        default: 0
    },
    songsQueued: {
      type: Number,
        default: 0
    },
    djBadge: {
      type: String,
        default: "None"
    },
    loyaltyBadge: {
      innerLocal: {
        type: String,
          default: "None"
      },
      outerGlobal: {
        type: String,
          default: "None"
      }
    }
});

const Users = mongoose.model('Users', userSchema);

module.exports = {
    Users: Users
};

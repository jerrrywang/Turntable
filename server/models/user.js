import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    twitchId: {
      type: String,
      required: true
    },
    isSubbed: {
        type: Boolean
    },
    isEarly: {
        type: Boolean
    },
    streak: {
      type: Number
    },
    loyaltyRate: {
      type: Number
    },
    currentLoyalty: {
      type: Number
    },
    totalLoyalty: {
      type: Number
    },
    djElo: {
      type: Number
    },
    songsQueued: {
      type: Number
    },
    djBadge: {
      type: String
    },
    loyaltyBadge: {
      innerLocal: {
        type: String
      },
      outerGlobal: {
        type: String
      }
    }
});

loyalties: {
  channelId: { //new object for each channel
    currentLoyalty: {
      type: Number
    },
    totalLoyalty: {
      type: Number
    },
    loyaltyBadge: {
      type: String
    }
  }
}

const User = mongoose.model('User', userSchema);

export default User;

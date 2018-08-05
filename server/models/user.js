import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    sub: {
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

const User = mongoose.model('User', userSchema);

export default User;

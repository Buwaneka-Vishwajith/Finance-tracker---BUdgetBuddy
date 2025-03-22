import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      threshold: {
        type: Number,
        default: 80, //percentage
      },
    },
  });
export default mongoose.model('Budget', budgetSchema);